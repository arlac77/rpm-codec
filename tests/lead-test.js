import test from 'ava';
import { defaultLead, readLead } from '../src/header';

const fs = require('fs');
const path = require('path');

// [ Buffer -> [] ]
Buffer.prototype.toByteArray = function() {
  return Array.prototype.slice.call(this, 0);
};

/*
test('should validate an RPM lead', t => {
  const l1 = defaultLead();
  //assert(header.byteArrayEqual([0xed, 0xab, 0xee, 0xdb], l1));
});
*/

// TODO test lead with bad length -> throw
// TODO test lead with bad magic -> throw

test.cb('Read lead from rpm package', t => {
  const filename = path.join(
    __dirname,
    '..',
    'tests',
    'fixtures',
    'mktemp-1.6-4mdv2010.1.i586.rpm'
  );

  fs.open(filename, 'r', function(status, fd) {
    if (status) {
      console.log(`Opening file ${filename} failed with ${status.message}`);
      t.fail(`Opening rpm file failed with ${status}`);
      t.end();
      return;
    }

    let buffer = new Buffer(96);
    fs.read(fd, buffer, 0, 96, 0, function(err, num) {
      if (err) {
        t.fail(`Reading failed with ${err}`);
        t.end();
        return;
      }
      let l = readLead(buffer.toByteArray());
      console.log(`Lead: ${JSON.stringify(l)}`);
      t.pass('Reading lead succeeded');
      t.end();
    });
  });
});
