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
import { tags, signatureTags } from './types';

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

    const readable = () => {
      //chunk = Buffer.concat([this.lastChunk, chunk]);

      let chunk = stream.read();

      //console.log(`${state.name} read: ${chunk.length}`);

      try {
        while (state) {
          console.log(`${state.name} ${offset}`);

          if (chunk.length >= state.length + state.additionalLength) {
            result = structDecode(chunk, 0, state.struct);
            const oldState = state;
            const length = state.length;
            offset += length;
            chunk = chunk.slice(length);

            [state, result] = state.nextState(chunk, offset, result, state);

            offset += oldState.additionalLength;
            chunk = chunk.slice(oldState.additionalLength);
          } else {
            break;
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

export function contentDecoder(fields) {
  let decompressor;

  switch (fields.get('PAYLOADCOMPRESSOR')) {
    case 'gzip':
      decompressor = zlib.createGunzip();
      break;
    case 'lzma':
      decompressor = lzma.createDecompressor();
      break;
  }

  const extract = cpio.extract();

  extract.on('error', error => console.log(error));
  extract.on('entry', (header, stream, callback) => {
    console.log(`extract: ${header.name}`);
    stream.on('end', () => callback());
    stream.resume();
  });

  decompressor.pipe(extract);

  return decompressor;
}
