import { readLead, LEAD_LENGTH } from './lead';
import { readHeader, readSignatureIndex, HEADER_LENGTH } from './header';

const bl = require('bl');
const { Transform } = require('stream');

/*
  states:
*/
const states = [
  {
    name: 'lead',
    requiredLength: LEAD_LENGTH,
    decode: readLead,
    nextState(state, stream, result) {
      return states.header;
    }
  },
  {
    name: 'header',
    requiredLength: HEADER_LENGTH,
    decode: readHeader,
    nextState(state, stream, result) {
      return Object.create(states.index, {
        requiredLength: {
          value: result.count
        }
      });
    }
  },
  {
    name: 'index',
    requiredLength: 0,
    decode: readSignatureIndex,
    nextState(state, stream, result) {
      return undefined;
    }
  }
].reduce((acc, cur) => {
  acc[cur.name] = cur;
  return acc;
}, {});

export class RPMStream extends Transform {
  constructor() {
    super();
    this._state = states.lead;
    this._buffer = bl();
  }

  _transform(chunk, encoding, done) {
    const b = this._buffer;
    b.append(chunk);

    let state = this._state;

    try {
      while (state) {
        if (b.length >= state.requiredLength) {
          const result = state.decode(b.slice(0, state.requiredLength));
          b.consume(state.requiredLength);

          console.log(`${state.name}: ${JSON.stringify(result)}`);

          this.emit(state.name, result);
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

    //this.push(chunk);

    done();
  }
}
