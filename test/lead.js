
"use strict"

var fs = require('fs');
var path = require('path');
// var Buffer = require('buffer').Buffer;

require('6to5/register');
var rpm = require('../');

var header = require('../lib/header');

// [ Buffer -> [] ]
Buffer.prototype.toByteArray = function () {
  return Array.prototype.slice.call(this, 0)
}

test('simple lead', function(assert) {
    var l1 = header.defaultLead();
    assert.ok(l1.slice(0, 4).equal([0xED, 0xAB, 0xEE, 0xDB]), 'magic is ok');
});

  // TODO test lead with bad length -> throw
  // TODO test lead with bad magic -> throw

test('Read lead from rpm package', function() {
    console.log('Executing read lead from rpm package');
    expect(1);
    stop();
    var filename = path.join(__dirname,'..','s1.f1-1.0.0.0-1.x86_64.rpm');
    console.log(`Opening file ${filename}`);
    fs.open(filename, 'r', function(status, fd) {
        if (status) {
            console.log(`Opening file ${filename} failed with ${status.message}`);
            ok(false, `Opening rpm file failed with ${status}`);
	    start();
            return;
        }
        console.log(`Reading lead...`);
        let buffer = new Buffer(96);
        fs.read(fd, buffer, 0, 96, 0, function(err, num) {
            if (err) {
                ok(false, `Reading failed with ${err}`);
                return;
            }
            let l = header.readLead(buffer.toByteArray());
            console.log(`Lead: ${JSON.stringify(l)}`);
            ok(true, "Reading lead succeeded");
            start();
            return buffer;
        });
    });
});

// EOF
