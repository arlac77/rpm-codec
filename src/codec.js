import { LEAD } from './lead';
import { FIELD, fieldDecode } from './field';
import { HEADER } from './header';
import {
  structDecode,
  structLength,
  structCheckDefaults,
  throwOnProblems,
  allign
} from './util';
import { tags, signatureTags, oses } from './types';

const { Transform } = require('stream');
const zlib = require('zlib');
const lzma = require('lzma-native');
const cpio = require('cpio-stream');

function nextHeaderState(stream, chunk, result, state) {
  throwOnProblems(structCheckDefaults(result, state.struct), state.name);

  const struct = { type: FIELD, length: result.count };

  const ns = Object.create(states.field, {
    length: {
      value: structLength(struct.type, struct.length)
    },
    struct: {
      value: struct
    },
    tags: {
      value: state.name === 'header' ? tags : signatureTags
    }
  });

  ns.additionalLength = result.size;

  return [ns];
}

const states = [
  {
    name: 'lead',
    struct: LEAD,
    nextState(chunk, offset, result, state) {
      throwOnProblems(structCheckDefaults(result, state.struct), state.name);
      return [states.signature];
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
    nextState(chunk, offset, fields, state) {
      fields = fields.reduce((m, c) => {
        c.data = fieldDecode(chunk, c);
        const t = state.tags.get(c.tag);
        m.set(t ? t.name : c.tag, c.data);
        return m;
      }, new Map());

      const allignedAdditional =
        allign(offset + state.additionalLength) - offset;

      const result = structDecode(chunk, allignedAdditional, HEADER);

      if (structCheckDefaults(result, HEADER) === undefined) {
        state.additionalLength = allignedAdditional;
        return [states.header];
      }

      return [undefined, fields];
    }
  }
].reduce((acc, cur) => {
  acc[cur.name] = cur;
  cur.additionalLength = 0;
  cur.length = structLength(cur.struct);
  return acc;
}, {});

export function RPMDecoder(stream) {
  return new Promise((resolve, reject) => {
    let state = states.lead;
    let offset = 0;
    let result;
    let lastChunk;

    const readable = () => {
      let chunk = stream.read();
      if (lastChunk !== undefined) {
        chunk = Buffer.concat([lastChunk, chunk]);
        lastChunk = undefined;
      }

      //console.log(`${state.name} read: ${chunk.length}`);

      try {
        while (state) {
          //console.log(`${state.name} ${offset}`);

          if (chunk.length >= state.length + state.additionalLength) {
            result = structDecode(chunk, 0, state.struct);
            //console.log(result);

            const oldState = state;
            const length = state.length;
            offset += length;
            chunk = chunk.slice(length);

            [state, result] = state.nextState(chunk, offset, result, state);
            offset += oldState.additionalLength;
            chunk = chunk.slice(oldState.additionalLength);
          } else {
            lastChunk = chunk;
            return;
          }
        }

        stream.removeListener('readable', readable);
        stream.unshift(chunk);

        resolve(result);
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

export function contentDecoder(fields, entryHandler = defaultEntryHandler) {
  let decompressor;

  switch (fields.get('PAYLOADCOMPRESSOR')) {
    case 'gzip':
      decompressor = zlib.createGunzip();
      break;
    case 'lzma':
    case 'xz':
      decompressor = lzma.createDecompressor();
      break;
  }

  const extract = cpio.extract();

  //extract.on('error', error => console.log(error));
  extract.on('entry', entryHandler);

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

  stream.write(headerWithValues(new Map(), signatureTags));

  stream.write(
    headerWithValues(
      new Map([['PAYLOADCOMPRESSOR', 'gzip'], ['PAYLOADFORMAT', 'cpio']]),
      tags
    )
  );
}
