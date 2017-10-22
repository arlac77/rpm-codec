import { readLead, LEAD_LENGTH } from './lead';
import { readHeader, readSignatureIndex, HEADER_LENGTH } from './header';

const bl = require('bl');
const { Transform } = require('stream');

/*
  states:
*/
const states = {
  initial: {
    requiredLength: LEAD_LENGTH,
    decode: readLead,
    nextState(state, stream, result) {
      stream.emit('lead', result);
      return states.structureHeader;
    }
  },
  structureHeader: {
    requiredLength: HEADER_LENGTH,
    decode: readHeader,
    nextState(state, stream, result) {
      return Object.create(states.signatureIndex, {
        requiredLength: {
          value: result.count
        }
      });
    }
  },
  signatureIndex: {
    requiredLength: 4711,
    decode: readSignatureIndex,
    nextState(state, stream, result) {
      return undefined;
    }
  }
};

export class RPMStream extends Transform {
  constructor() {
    super();
    this._state = states.initial;
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
