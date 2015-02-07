/* jslint node: true, esnext: true */

"use strict";

var fs = require('fs');
var path = require('path');
// var Buffer = require('buffer').Buffer;

require('6to5/register');
var assert = require('assert');
var rpm = require('../');
var header = require('../lib/header');

describe('Convert byte[] to number', function() {
  assert.equal(0, header.num([0]), "Can convert 0");
});

describe('Convert byte[] to number', function() {
  assert.equal(65537, header.num([1, 0, 1]), "Can convert large numbers");
});

// [ Buffer -> [] ]
Buffer.prototype.toByteArray = function() {
  return Array.prototype.slice.call(this, 0);
};

describe('Read header from rpm package', function() {
  it('should work', function(done) {
    var filename = path.join(__dirname, 'fixtures/mktemp-1.6-4mdv2010.1.i586.rpm');
    fs.open(filename, 'r', function(status, fd) {
      if (status) {
        assert(false, "Opening rpm file failed: " + status);
        done();
        return;
      }
      let buffer = new Buffer(2048);
      let offset = 0;
      let length = buffer.length;
      let position = 0;
      let n = fs.readSync(fd, buffer, offset, length, position);
      console.log(`Read ${n} bytes`);
      parse(buffer.toByteArray());
      done();
    });
  });
});

var parse = function(bs) {
  let hs = {};

  console.log(`Reading lead`);

  // Read lead
  let pos = 0;
  let l = header.readLead(bs);
  console.log(`- Read lead: ${JSON.stringify(l)}`);
  hs.lead = l;

  console.log(`Reading signatures`);

  // Read signatures/header
  pos += header.LEAD_LENGTH;
  let m = header.readHeader(bs.slice(pos));

  // Read signatures/index
  pos += header.headerStructureHeaderLength;
  let sigs = header.readSignatureIndex(bs.slice(pos), m.count);

  // Read signatures/store
  pos += header.oneIndexSize * m.count;
  sigs = header.readStore(sigs, bs.slice(pos));
  hs.signatures = sigs;

  console.log(`Reading header`);

  // Same for header now
  let signatureStoreSize = header.storeSize(sigs);
  pos += signatureStoreSize;
  m = header.readHeader(bs.slice(pos));
  pos += header.headerStructureHeaderLength;
  let ids = header.readHeaderIndex(bs.slice(pos), m.count);
  pos += header.oneIndexSize * m.count;

  console.log(`Expected store position: ${pos} (${pos.toString(16)})`);

  ids = header.readStore(ids, bs.slice(pos));
  hs.header = ids;

  // Just for fun - forward into payload
  let headerStoreSize = header.storeSize(ids);
  pos += headerStoreSize;
  console.log(`cpio payload starts at position ${pos} (${pos.toString(16)})`);

  console.log(`Complete header: ${JSON.stringify(hs)}`);
  return hs;
};