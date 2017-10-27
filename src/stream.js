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
      console.log(result);
      stream.emit(state.name, result);

      const struct = { type: FIELD, length: result.count };
      return Object.create(states.field, {
        length: {
          value: structLength(struct.type, struct.length)
        },
        struct: {
          value: struct
        },
        additionalLength: {
          value: result.size //+ 4
        }
      });
    }
  },
  {
    name: 'field',
    struct: FIELD,
    nextState(stream, chunk, fields, state) {
      fields = fields.reduce((m, c) => {
        console.log(c);
        //console.log(`[${c.tag}] ${c.type} ${c.offset} ${c.count}`);
        c.data = fieldDecode(chunk, c);
        const t = tags.get(c.tag);
        if (t === undefined) {
          console.log(`undefined tag: ${c.tag}`);
        }
        m.set(t ? t.name : c.tag, c);
        return m;
      }, new Map());

      stream.emit(state.name, fields);

      const result = structDecode(chunk, state.additionalLength, HEADER);

      //console.log(result);
      if (
        result.magic[0] === HEADER[0].default[0] &&
        result.magic[1] === HEADER[0].default[1] &&
        result.magic[2] === HEADER[0].default[2]
      ) {
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
        /*console.log(
          `${state.name}: ${chunk.length} >= ${state.length +
            state.additionalLength}`
        );*/
        if (chunk.length >= state.length + state.additionalLength) {
          const result = structDecode(chunk, 0, state.struct);

          /*console.log(
            `decode ${state.name} at ${this._offset} ${state.length}`
          );*/

          const length = state.length;
          const additionalLength = state.additionalLength;

          this._offset += length;
          chunk = chunk.slice(length);

          state = state.nextState(this, chunk, result, state);

          this._offset += additionalLength;
          chunk = chunk.slice(additionalLength);
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
