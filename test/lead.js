
"use strict"

var fs = require('fs');
var path = require('path');
// var Buffer = require('buffer').Buffer;

require('6to5/register');
var rpm = require('../');

var header = require('../lib/header');

// Read existing rpm from local filesystem
function readRpmLead(filename) {
    fs.open(filename, 'r', function(status, fd) {
        if (status) {
            console.log(status.message);
            ok(false, "Opening rpm file failed:" + status);
		start();
            return;
        }
        let buffer = new Buffer(100);
        fs.read(fd, buffer, 0, 100, 0, function(err, num) {
            console.log(buffer.toString('utf-8', 0, num));
            return buffer;
        });
    });
}

QUnit.test('Empty test', function(assert) {
    console.log('empty test');
    assert.ok(true, "Always ok");
});

QUnit.test('simple lead', function(assert) {
    var l1 = header.defaultLead();
    assert.ok(l1.slice(0, 4).equal([0xED, 0xAB, 0xEE, 0xDB]), 'magic is ok');
});

  // TODO test lead with bad length -> throw
  // TODO test lead with bad magic -> throw

/*
test('Read lead from rpm package', function() {
    console.log('Executing read lead from rpm package');
    expect(1);
    stop();
 
    var l = readRpmLead('s1.f1-1.0.0.0-1.x64_64.rpm');
    console.log(header.readLead(l));
});
*/

test("this is an async test example", function () {
    expect(1);
    stop();
    var filename = path.join(__dirname,'..','s1.f1-1.0.0.0-1.x86_64.rpm');
    fs.open(filename, 'r', function(status, fd) {
        if (status) {
            console.log(status.message);
            ok(false, "Opening rpm file failed:" + status);
		start();
            return;
        }
        let buffer = new Buffer(100);
        fs.read(fd, buffer, 0, 100, 0, function(err, num) {
            //console.log(buffer.toString('utf-8', 0, num));
            ok(true, "looks good");
		start();
            return buffer;
        });
    });
/*
    setTimeout(function () {
        ok(true, "finished async test");
        strictEqual(true, true, "Strict equal assertion uses ===");
        start();
    }, 100);
*/
});

