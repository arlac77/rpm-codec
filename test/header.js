
"use strict"

var fs = require('fs');
// var Buffer = require('buffer').Buffer;

require('6to5/register');
var rpm = require('../');

var header = require('../lib/header');

test('Convert byte[] to number', function() {
    equal(0, header.num([0]), "Can convert 0");
})

test('Convert byte[] to number', function() {
    equal(65537, header.num([1, 0, 1]), "Can convert large numbers");
})

// [ Buffer -> [] ]
Buffer.prototype.toByteArray = function () {
  return Array.prototype.slice.call(this, 0)
}

test('Read header from rpm package', function() {
    stop();
    expect(1);

    fs.open('s1.f1-1.0.0.0-1.x86_64.rpm', 'r', function(status, fd) {
        console.log("1");
        if (status) {
            ok(false, "Opening rpm file failed: " + status);
	    start();
            return;
        }
        // Read header/header
        let buffer = new Buffer(16);
        fs.read(fd, buffer, 0, 16, 96, function(err, num) {
            if (err) ok(false, `Reading header header failed: ${err} at ${num}`)
            let m = header.readHeader(buffer.toByteArray());
            console.log(`Read header entry ${JSON.stringify(m)}`);
            
            // Read header/index
            buffer = new Buffer(m.size);
            console.log(`Reading header index (${m.size} bytes)`);
            fs.read(fd, buffer, 0, m.size, 96+16, function(err, num) {
                if (err) ok(false, `Reading header index failed: ${err} at ${num}`)
                let indices = header.readIndex(buffer.toByteArray(), m.count);
                console.log(`Found ${indices.length} index entries`);
                console.log('Indices:');
                for (let i = 0; i < indices.length; i++) {
                    for (let k of Object.keys(indices[i])) {
                        let val = indices[i][k];
                        let msg = (k == 'type' ? `(${Object.keys(header.types)[val]})` : '')
                        let tag = (k == 'tag' ? `(${Object.keys(header.headerTags)[val-1000]})` : '')
                        console.log(`Index ${i}: ${k} = ${val} ${msg} ${tag}`);
                    }
                }
                // Read header/store
                // Size is the TODO
                buffer = new Buffer(1024);
                fs.read(fd, buffer, 0, buffer.length, 96 + 16 + (indices.length * 16), function(err, num) {
                    if (err) {
                        ok.false(`Reading store failed with ${err}`);
                        return;
                    }
                });
            });
            ok(true, `Read index`);
            start();
            return buffer;
        });
    });
});
