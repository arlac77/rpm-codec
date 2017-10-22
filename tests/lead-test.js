import test from 'ava';
import { readLead } from '../src/lead';

const fs = require('fs');
const path = require('path');

// [ Buffer -> [] ]
Buffer.prototype.toByteArray = function() {
  return Array.prototype.slice.call(this, 0);
};

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
      t.pass('Reading lead succeeded');
      t.end();
    });
  });
});
