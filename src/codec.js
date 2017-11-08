import { LEAD } from './lead';
import { FIELD, fieldDecode } from './field';
import { HEADER, headerWithValues } from './header';
import {
  structDecode,
  structEncode,
  structLength,
  structDefaults,
  structCheckDefaults,
  throwOnProblems,
  allign
} from './util';
import { tags, signatureTags, oses, architectures } from './types';

const zlib = require('zlib');
const cpio = require('cpio-stream');

let lzma;

try {
  lzma = require('lzma-native');
} catch (e) {}

function nextHeaderState(stream, chunk, results, lastResult, state) {
  results[state.name] = lastResult;

  throwOnProblems(structCheckDefaults(lastResult, state.struct), state.name);
  lastResult.values = new Map();

  const struct = { type: FIELD, length: lastResult.count };

  const ns = Object.create(states.field, {
    length: {
      value: structLength(struct.type) * struct.length
    },
    struct: {
      value: struct
    },
    values: {
      value: lastResult.values
    },
    tags: {
      value: state.name === 'header' ? tags : signatureTags
    }
  });

  ns.additionalLength = lastResult.size;

  return ns;
}

const states = [
  {
    name: 'lead',
    struct: LEAD,
    nextState(chunk, offset, results, lastResult, state) {
      results[state.name] = lastResult;
      throwOnProblems(
        structCheckDefaults(lastResult, state.struct),
        state.name
      );

      return states.signature;
    }
  },
  {
    name: 'signature',
    struct: HEADER,
    nextState: nextHeaderState
  },
  {
    name: 'header',
    struct: HEADER,
    nextState: nextHeaderState
  },
  {
    name: 'field',
    struct: FIELD,
    nextState(chunk, offset, results, lastResult, state) {
      lastResult.reduce((m, c) => {
        c.data = fieldDecode(chunk, c);
        const t = state.tags.get(c.tag);
        m.set(t ? t.name : c.tag, c.data);
        return m;
      }, state.values);

      const allignedAdditional =
        allign(offset + state.additionalLength) - offset;

      const next = structDecode(chunk, allignedAdditional, HEADER);

      if (structCheckDefaults(next, HEADER) === undefined) {
        state.additionalLength = allignedAdditional;
        return states.header;
      }

      return undefined;
    }
  }
].reduce((acc, cur) => {
  acc[cur.name] = cur;
  cur.additionalLength = 0;
  cur.length = structLength(cur.struct);
  return acc;
}, {});

/**
 * Decodes the rpm header.
 * { lead : {},
 *  signature : {}
 *  header: {}
 * }
 * @return
 */
export async function RPMDecoder(stream) {
  return new Promise((resolve, reject) => {
    let state = states.lead;
    let offset = 0;
    let lastChunk;

    const results = {};

    const readable = () => {
      let chunk = stream.read();

      if (chunk === null) {
        stream.removeListener('readable', readable);
        reject(
          new TypeError(
            `Unexpected end of stream at ${offset} while reading ${state.name}`
          )
        );
      }

      try {
        if (lastChunk !== undefined) {
          chunk = Buffer.concat([lastChunk, chunk]);
          lastChunk = undefined;
        }

        while (state) {
          if (chunk.length >= state.length + state.additionalLength) {
            const lastResult = structDecode(chunk, 0, state.struct);

            const oldState = state;
            const length = state.length;
            offset += length;
            chunk = chunk.slice(length);

            state = state.nextState(chunk, offset, results, lastResult, state);
            offset += oldState.additionalLength;
            chunk = chunk.slice(oldState.additionalLength);
          } else {
            lastChunk = chunk;
            return;
          }
        }

        stream.removeListener('readable', readable);
        stream.unshift(chunk);

        resolve(results);
      } catch (e) {
        stream.removeListener('readable', readable);
        reject(e);
      }
    };

    stream.on('readable', readable);
  });
}

const defaultEntryHandler = (header, stream, callback) => {
  console.log(`extract: ${header.name}`);
  stream.on('end', () => callback());
  stream.resume();
};

export function contentDecoder(result, entryHandler = defaultEntryHandler) {
  let decompressor;

  const plc = result.header.values.get('PAYLOADCOMPRESSOR');

  switch (plc) {
    case 'gzip':
      decompressor = zlib.createGunzip();
      break;
    case 'lzma':
    case 'xz':
      if (lzma !== undefined) {
        decompressor = lzma.createDecompressor();
        break;
      }

    default:
      throw new TypeError(`Unsupported payloadcompressor ${plc}`);
  }

  let extract;

  const plf = result.header.values.get('PAYLOADFORMAT');

  switch (plf) {
    case 'cpio':
      extract = cpio.extract();
      extract.on('entry', entryHandler);
      break;
    default:
      throw new TypeError(`Unsupported payloadformat ${plf}`);
  }

  decompressor.pipe(extract);

  return decompressor;
}

export function RPMEncoder(stream, options) {
  const lead = structDefaults(LEAD);
  lead.name = options.name;
  lead.os = oses.get(options.os).id;
  lead.arch = architectures.get(options.architecture).id;
  lead.type = 0;

  const buffer = new Buffer(structLength(LEAD));
  structEncode(lead, buffer, 0, LEAD);
  stream.write(buffer);

  stream.write(
    headerWithValues(
      new Map([
        [
          'MD5',
          new Uint8Array([
            0xa0,
            0xa1,
            0xa2,
            0xa3,
            0xa4,
            0xa5,
            0xa6,
            0xa7,
            0xa8,
            0xa9,
            0xaa,
            0xab,
            0xac,
            0xad,
            0xae,
            0xaf
          ])
        ]
      ]),
      signatureTags
    )
  );

  /*
  stream.write(
    headerWithValues(
      new Map([
      ['REQUIRENAME', ['rpmlib(VersionedDependencies)','rpmlib(PayloadFilesHavePrefix)','rpmlib(CompressedFileNames)']],
      ['REQUIREVERSION', ['3.0.3-1','4.0-1','3.0.4-1']],

      ['PAYLOADCOMPRESSOR', 'gzip'],
      ['PAYLOADFORMAT', 'cpio']]),
      tags
    )
  );
  */
}
