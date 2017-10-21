/* jslint node: true, esnext: true */

"use strict";

const bl = require('bl');
const util = require('util');
const Transform = require('stream').Transform;
const header = require('./header');

util.inherits(RPMStream, Transform);

/*
  states:
*/
const states = {
	"initial": {
		requiredLength: header.LEAD_LENGTH,
		decode: header.readLead,
		nextState: function(state, stream) {
			stream.emit('lead', state.result);
			return states.structureHeader;
		}
	},
	"structureHeader": {
		requiredLength: header.headerStructureHeaderLength,
		decode: header.readHeader,
		nextState: function(state, stream) {
			return Object.create(states.signatureIndex, {
				requiredLength: {
					value: state.result.count
				}
			});
		}
	},
	"signatureIndex": {
		requiredLength: 4711,
		decode: header.readSignatureIndex,
		nextState: function(state, stream) {
			return undefined;
		}
	}
};



function RPMStream(options) {
	if (!(this instanceof RPMStream))
		return new RPMStream(options);

	Transform.call(this, options);
	this._state = 0;
	this._buffer = bl();

	this._state = states.initial;
}


RPMStream.prototype._transform = function(chunk, encoding, done) {

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
};

module.exports = RPMStream;
