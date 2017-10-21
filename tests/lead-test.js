const fs = require('fs');
const path = require('path');

import test from 'ava';
import { defaultLead } from './src/header';

var assert = require('assert');
var mocha = require('mocha');
var rpm = require('../');

var header = require('../lib/header');

// [ Buffer -> [] ]
Buffer.prototype.toByteArray = function() {
  return Array.prototype.slice.call(this, 0);
};

test('should validate an RPM lead', t => {
  const l1 = defaultLead();
  //assert(header.byteArrayEqual([0xed, 0xab, 0xee, 0xdb], l1));
});

// TODO test lead with bad length -> throw
// TODO test lead with bad magic -> throw

test.cb('Read lead from rpm package', t => {
  const filename = path.join(
    __dirname,
    '.',
    'fixtures/mktemp-1.6-4mdv2010.1.i586.rpm'
  );

  fs.open(filename, 'r', function(status, fd) {
    if (status) {
      console.log(`Opening file ${filename} failed with ${status.message}`);
      assert(false, `Opening rpm file failed with ${status}`);
      done();
      return;
    }

    let buffer = new Buffer(96);
    fs.read(fd, buffer, 0, 96, 0, function(err, num) {
      if (err) {
        assert(false, `Reading failed with ${err}`);
        done();
        return;
      }
      let l = header.readLead(buffer.toByteArray());
      console.log(`Lead: ${JSON.stringify(l)}`);
      assert(true, 'Reading lead succeeded');
      done();
    });
  });
});

// EOF
