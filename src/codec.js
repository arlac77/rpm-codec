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
import { createGunzip } from 'zlib';
import { extract } from 'cpio-stream';
import { createDecompressor } from 'lzma-native';

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
 * decoded rpm header
 * @typedef {Object} RPMHeader
 * @property {Object} lead
 * @property {Object} signature
 * @property {Object} header
 */

/**
 * Decodes the rpm header.
 * @param {Stream} stream
 * @return {RPMHeader}
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

/**
 * null handler simply skips content
 * @param {Object} header file header
 * @param {ReadStream} stream
 * @param {Function} callback
 */
const defaultEntryHandler = (header, stream, callback) => {
  //console.log(`extract: ${header.name}`);
  stream.on('end', () => callback());
  stream.resume();
};

/**
 * Decode the body part of an rpm stream
 * @param {RPMHeader} result
 * @param {EntryHandler} entryHandler
 */
export function contentDecoder(result, entryHandler = defaultEntryHandler) {
  let decompressor;

  const plc = result.header.values.get('PAYLOADCOMPRESSOR');

  switch (plc) {
    case 'gzip':
      decompressor = createGunzip();
      break;
    case 'lzma':
    case 'xz':
      decompressor = createDecompressor();
      break;

    default:
      throw new TypeError(`Unsupported payloadcompressor ${plc}`);
  }

  let e;

  const plf = result.header.values.get('PAYLOADFORMAT');

  switch (plf) {
    case 'cpio':
      e = extract();
      e.on('entry', entryHandler);
      break;
    default:
      throw new TypeError(`Unsupported payloadformat ${plf}`);
  }

  decompressor.pipe(e);

  return decompressor;
}

export function RPMEncoder(stream, options) {
  const lead = structDefaults(LEAD);
  lead.name = options.name;
  lead.os = oses.get(options.os).id;
  lead.arch = architectures.get(options.architecture).id;
  lead.type = 0;

  const buffer = new Buffer.alloc(structLength(LEAD));
  structEncode(lead, buffer, 0, LEAD);
  stream.write(buffer);

  stream.write(
    headerWithValues(
      new Map([
        [
          'SIGNATURES',
          new Uint8Array([
            0,
            0,
            0,
            62,
            0,
            0,
            0,
            7,
            255,
            255,
            255,
            144,
            0,
            0,
            0,
            16
          ])
        ],
        [
          'DSA',
          new Uint8Array([
            136,
            63,
            3,
            5,
            0,
            76,
            34,
            11,
            196,
            231,
            137,
            138,
            224,
            112,
            119,
            31,
            243,
            17,
            2,
            83,
            92,
            0,
            158,
            41,
            175,
            155,
            28,
            18,
            134,
            208,
            211,
            99,
            154,
            104,
            63,
            200,
            215,
            222,
            102,
            171,
            123,
            173,
            85,
            0,
            158,
            38,
            212,
            165,
            176,
            0,
            232,
            109,
            167,
            188,
            145,
            117,
            133,
            151,
            21,
            40,
            230,
            202,
            11,
            27,
            6
          ])
        ],
        ['SHA1', '8201decf2e7d589983931f9720860a72ea867002'],
        ['SIZE', 673579008],
        ['PAYLOADSIZE', 4231004160],
        [
          'MD5',
          new Uint8Array([
            0x74,
            0x5c,
            0x0d,
            0xe1,
            0x49,
            0xea,
            0xe9,
            0x66,
            0xdf,
            0x7c,
            0x69,
            0x49,
            0x48,
            0x03,
            0x85,
            0x85
          ])
        ],

        [
          'GPG',
          new Uint8Array([
            136,
            63,
            3,
            5,
            0,
            76,
            34,
            11,
            196,
            231,
            137,
            138,
            224,
            112,
            119,
            31,
            243,
            17,
            2,
            210,
            168,
            0,
            160,
            170,
            3,
            230,
            191,
            199,
            205,
            21,
            142,
            135,
            36,
            79,
            218,
            215,
            61,
            203,
            192,
            121,
            114,
            46,
            208,
            0,
            158,
            43,
            50,
            38,
            103,
            147,
            230,
            78,
            191,
            191,
            54,
            48,
            85,
            160,
            61,
            235,
            64,
            158,
            225,
            50,
            191
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
