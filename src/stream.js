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
  console.log(result);

  throwOnProblems(structCheckDefaults(result, state.struct), state.name);
  stream.emit(state.name, result);

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

  return ns;
}

const states = [
  {
    name: 'lead',
    struct: LEAD,
    nextState(stream, chunk, result, state) {
      throwOnProblems(structCheckDefaults(result, state.struct), state.name);
      stream.emit(state.name, result);
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
    nextState(stream, chunk, fields, state) {
      fields = fields.reduce((m, c) => {
        //console.log(c);
        //console.log(`[${c.tag}] ${c.type} ${c.offset} ${c.count}`);
        c.data = fieldDecode(chunk, c);
        const t = state.tags.get(c.tag);
        m.set(t ? t.name : c.tag, c.data);
        return m;
      }, new Map());

      stream.emit(state.name, fields);

      const compressor = fields.get('PAYLOADCOMPRESSOR');

      switch (compressor) {
        case 'gzip':
          stream.decompressor = zlib.createGunzip();
          break;
        case 'lzma':
          stream.decompressor = lzma.createDecompressor();
          break;
      }

      const extract = cpio.extract();
      extract.on('error', error => console.log(error));
      extract.on('entry', (header, stream, callback) => {
        console.log(`extract: ${header.name}`);

        stream.on('end', () => callback());
        stream.resume();
      });

      const allignedAdditional =
        allign(stream._offset + state.additionalLength) - stream._offset;

      const result = structDecode(chunk, allignedAdditional, HEADER);

      if (structCheckDefaults(result, HEADER) === undefined) {
        console.log(`ASSIGN: ${state.additionalLength}`);

        state.additionalLength = allignedAdditional;

        //console.log(`${JSON.stringify(result)}`);
        return states.header;
      }

      console.log(chunk.slice(0, 8));

      return undefined;
    }
  }
].reduce((acc, cur) => {
  acc[cur.name] = cur;
  cur.additionalLength = 0;
  cur.length = structLength(cur.struct);
  return acc;
}, {});

export class RPMStream extends Transform {
  constructor() {
    super();
    this._state = states.lead;
    this._offset = 0;
  }

  _transform(chunk, encoding, done) {
    if (this.lastChunk !== undefined) {
      chunk = Buffer.concat([this.lastChunk, chunk]);
      this.lastChunk = undefined;
    }

    let state = this._state;

    try {
      while (state) {
        console.log(
          `${state.name} ${chunk.length} > ${state.length +
            state.additionalLength}`
        );
        if (chunk.length >= state.length + state.additionalLength) {
          const result = structDecode(chunk, 0, state.struct);

          /*console.log(
            `decode ${state.name} at ${this._offset} ${state.length}`
          );*/

          const oldState = state;

          const length = state.length;
          this._offset += length;
          chunk = chunk.slice(length);

          state = state.nextState(this, chunk, result, state);

          this._offset += oldState.additionalLength;
          chunk = chunk.slice(oldState.additionalLength);
        } else {
          break;
        }
      }
    } catch (e) {
      this.emit('error', e);
      state = undefined;
    }

    this._state = state;

    if (this.decompressor) {
      console.log(`pipe: ${this._offset}`);
      //this.pipe(this.decompressor).pipe(process.stdio);
    }

    done();
  }
}
