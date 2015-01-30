"use strict";

var util = require('util');
var Transform = require('stream').Transform;


util.inherits(RPMStream, Transform);

/*
  states:
   0 initial
	 1 loading chunk
   2 lead detected
   2 ....
   3 content
*/

function RPMStream(options) {
  if (!(this instanceof RPMStream))
    return new RPMStream(options);

  Transform.call(this, options);
  this._state = 0;
}

RPMStream.prototype._transform = function(chunk, encoding, done) {
  console.log("length: " + chunk.length);

  do {
    switch (this._state) {
      case 0:
        if (chunk.length >= 4) {
          if (chunk[0] === 0xED && chunk[1] === 0xAB && chunk[2] === 0xEE &&
            chunk[3] === 0xDB) {
            this.emit('header', chunk);
            this._state = 3;
          } else {
            this.emit('error', new Error('invalid RPM header'));
          }
        } else {
          this._state = 1;
          this._buffer = chunk;
        }

        break;
    }
    console.log("while: " + this._state);
  } while (this._state !== 3);

  console.log("done: ");

  this.push(chunk);

  done();
};

module.exports = RPMStream;
