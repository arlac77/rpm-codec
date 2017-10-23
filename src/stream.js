import { LEAD } from './lead';
import { FIELD } from './field';
import { HEADER } from './header';
import { structDecode, structLength, structCheckDefaults } from './util';

const { Transform } = require('stream');

/*
  states:
*/
const states = [
  {
    name: 'lead',
    struct: LEAD,
    nextState(state, stream, result) {
      structCheckDefaults(result, LEAD, 'lead');
      return states.header;
    }
  },
  {
    name: 'header',
    struct: HEADER,
    nextState(state, stream, result) {
      structCheckDefaults(result, HEADER, 'header');
      return Object.create(states.field, {
        length: {
          value: structLength(FIELD, result.count)
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
    nextState(state, stream, result) {
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
    if (this.lastChunk !== undefined) {
      chunk = Buffer.concat([this.lastChunk, chunk]);
      this.lastChunk = undefined;
    }

    let state = this._state;

    try {
      while (state) {
        if (chunk.length >= state.length) {
          const result = structDecode(chunk, 0, state.struct);
          console.log(
            `${state.name} ${state.length}: ${JSON.stringify(result)}`
          );
          this.emit(state.name, result);
          chunk = chunk.slice(state.length);
          state = state.nextState(state, this, result);
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
