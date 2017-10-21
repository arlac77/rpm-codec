const bl = require('bl');
const { Transform } = require('stream');

import {
  LEAD_LENGTH,
  headerStructureHeaderLength,
  readLead,
  readHeader,
  readSignatureIndex
} from './header';

/*
  states:
*/
const states = {
  initial: {
    requiredLength: LEAD_LENGTH,
    decode: readLead,
    nextState(state, stream) {
      stream.emit('lead', state.result);
      return states.structureHeader;
    }
  },
  structureHeader: {
    requiredLength: headerStructureHeaderLength,
    decode: readHeader,
    nextState(state, stream) {
      return Object.create(states.signatureIndex, {
        requiredLength: {
          value: state.result.count
        }
      });
    }
  },
  signatureIndex: {
    requiredLength: 4711,
    decode: readSignatureIndex,
    nextState(state, stream) {
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
          state.result = state.decode(b.slice(0, state.requiredLength));
          b.consume(state.requiredLength);
          state = state.nextState(state, this);
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
