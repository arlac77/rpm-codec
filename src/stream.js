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
      return Object.create(states.field, {
        length: {
          value: result.size + structLength(FIELD, result.count)
        },
        struct: {
          value: { type: FIELD, length: result.count }
        }
      });
    }
  },
  {
    name: 'field',
    struct: FIELD,
    nextState(stream, chunk, fields, state) {
      fields = fields.reduce((m, c) => {
        c.data = fieldDecode(chunk, c);
        const t = tags.get(c.tag);
        if (t === undefined) {
          console.log(`undefined tag: ${c.tag}`);
        }
        m.set(t ? t.name : c.tag, c);
        return m;
      }, new Map());

      stream.emit(state.name, fields);

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
  }

  _transform(chunk, encoding, done) {
    console.log(`new chunk: ${chunk.length}`);
    if (this.lastChunk !== undefined) {
      chunk = Buffer.concat([this.lastChunk, chunk]);
      this.lastChunk = undefined;
    }

    let state = this._state;

    try {
      while (state) {
        if (chunk.length >= state.length) {
          const result = structDecode(chunk, 0, state.struct);
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
