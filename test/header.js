
"use strict"

var fs = require('fs');
var path = require('path');
// var Buffer = require('buffer').Buffer;

require('6to5/register');
var assert = require('assert')
var rpm = require('../');

var header = require('../lib/header');

describe('Convert byte[] to number', function() {
  assert.equal(0, header.num([0]), "Can convert 0");
})

describe('Convert byte[] to number', function() {
  assert.equal(65537, header.num([1, 0, 1]), "Can convert large numbers");
})

// [ Buffer -> [] ]
Buffer.prototype.toByteArray = function () {
  return Array.prototype.slice.call(this, 0)
}

describe('Read header from rpm package', function() {
  it('should work', function(done) {
    var filename = path.join(__dirname
      , 'fixtures/mktemp-1.6-4mdv2010.1.i586.rpm');
    fs.open(filename, 'r', function(status, fd) {
      console.log("1");
      if (status) {
        assert.ok(false, "Opening rpm file failed: " + status);
        return;
      }
      // Read header/header
      let buffer = new Buffer(16);
      fs.read(fd, buffer, 0, 16, 96, function(err, num) {
        if (err) ok(false, `Reading header header failed: ${err} at ${num}`)
        let m = header.readHeader(buffer.toByteArray());
        console.log(`Read header entry ${JSON.stringify(m)}`);

        // Read signatures/index
        buffer = new Buffer(m.size);
        console.log(`Reading signature index (${m.size} bytes)`);
        fs.read(fd, buffer, 0, m.size, 96+16, function(err, num) {
          if (err) {
            assert(false, `Reading signature index failed: ${err} at ${num}`)
            done();
            return;
          }
          let indices = header.readIndex(buffer.toByteArray(), m.count);
          console.log(`Found ${indices.length} index entries`);
          console.log('Indices:');
          var sigs = [];
          for (let i = 0; i < indices.length; i++) {
            let ix = {};
            for (let k of Object.keys(indices[i])) {
              let val = indices[i][k];
              let msg = (k == 'type' ? `${header.types[val]}` : '')
              let tag = (k == 'tag' ? `${header.signatureTags[val]}` : '')
              console.log(`Signature #${i}: ${k} = ${val} ${msg} ${tag}`);
              ix[k] = val;
            }

            // Add human readable string represenatation for tag and type
            ix.stype = header.types[ix.type];
            ix.stag = header.signatureTags[ix.tag];
            sigs[i] = ix;
          }
          // Read signatures/store
          let signatureStoreSize = header.storeSize(sigs);
          buffer = new Buffer(signatureStoreSize);
          console.log(`Reading signature store (${signatureStoreSize} bytes)`);
          fs.read(fd, buffer, 0, buffer.length, 96 + 16 + (indices.length * 16)
          , function(err, num) {

            if (err) {
              assert(false, `Reading store failed with ${err}`);
              return;
            }
            // Show first signature incl. storage data
            for (let i = sigs.length; --i >=0; ) {
              let f = sigs[i];
              let v = header.readStoreValue(buffer, f);
              sigs[i].value = v;
            }
            console.log(`Read signatures: ${JSON.stringify(sigs)}`);
            done();
          });
        });
      });
    });
  });
})
