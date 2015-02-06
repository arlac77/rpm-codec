var rpm_stream = require('../lib/stream');
var fs = require('fs');
var path = require('path');
var assert = require('assert')
var mocha = require('mocha')

describe('simple unpack header', function() {
  it('should work', function(done) {
    var stream = rpm_stream();
    // TODO expect(1);

    stream.on('header', function(chunk) {
      assert(chunk.length >= 4, "is good");
      done();
    });

    fs.createReadStream(path.join(__dirname,
      'fixtures/mktemp-1.6-4mdv2010.1.i586.rpm')).pipe(stream);
  });
});

describe('fail unpack invalid header', function() {
  it('should work', function(done) {
    var stream = rpm_stream();
    // TODO expect(1);

    stream.on('error', function(e) {
      assert(e, "failed with " + e);
      done();
    });

    fs.createReadStream(path.join(__dirname,
      'extract.js')).pipe(stream);
  });
});
