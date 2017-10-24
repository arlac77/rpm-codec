import { LEAD } from './lead';
import { FIELD, fieldDecode } from './field';
import { HEADER } from './header';
import { structDecode, structLength, structCheckDefaults } from './util';
import { tags } from './types';

const { Transform } = require('stream');

/*
  states:
*/
const states = [
  {
    name: 'lead',
    struct: LEAD,
    nextState(stream, chunk, result, state) {
      structCheckDefaults(result, LEAD, 'lead');
      stream.emit(state.name, result);
      return states.header;
    }
  },
  {
    name: 'header',
    struct: HEADER,
    nextState(stream, chunk, result, state) {
      structCheckDefaults(result, HEADER, 'header');
      stream.emit(state.name, result);

      const struct = { type: FIELD, length: result.count };
      return Object.create(states.field, {
        length: {
          value: structLength(struct.type, struct.length)
        },
        struct: {
          value: struct
        }
      });
    }
  },
  {
    name: 'field',
    struct: FIELD,
    nextState(stream, chunk, fields, state) {
      fields = fields.reduce((m, c) => {
        console.log(
          `[${c.tag}] ${stream._offset} ${stream._offset + c.offset}`
        );
        c.data = fieldDecode(chunk, c);
        const t = tags.get(c.tag);
        if (t === undefined) {
          console.log(`undefined tag: ${c.tag}`);
        }
        m.set(t ? t.name : c.tag, c);
        return m;
      }, new Map());

      stream.emit(state.name, fields);

      const a = new Uint8Array(3);
      for (let i = 0; i < 3; i++) {
        a[i] = chunk.readUInt8(state.length + i);
      }
      console.log(a);

      return undefined;
    }
  }
].reduce((acc, cur) => {
  acc[cur.name] = cur;
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
        if (chunk.length >= state.length) {
          const result = structDecode(chunk, 0, state.struct);
          this._offset += state.length;
          chunk = chunk.slice(state.length);
          state = state.nextState(this, chunk, result, state);
        } else {
          break;
        }
      }
    } catch (e) {
      this.emit('error', e);
      state = undefined;
    }

    this._state = state;

    done();
  }
}
