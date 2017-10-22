import test from 'ava';
import { RPMStream } from '../src/stream';
import { num } from './src/header';

const fs = require('fs');
const path = require('path');

const zlib = require('zlib');
const sbuff = require('simple-bufferstream');

const cpio = require('cpio-stream');

test('Convert byte[] to number', t => {
  t.is(0, num([0]), 'Can convert 0');
});

test('Convert byte[] to number', t => {
  t.is(65537, num([1, 0, 1]), 'Can convert large numbers');
});

// [ Buffer -> [] ]
Buffer.prototype.toByteArray = function() {
  return Array.prototype.slice.call(this, 0);
};

test('Read header from rpm package', t => {
  const filename = path.join(
    __dirname,
    '..',
    'tests',
    'fixtures',
    'mktemp-1.5-12sls.i586.rpm'
  );
  const buffer = fs.readFileSync(filename);
  console.log(`Read ${buffer.length} bytes`);
  parse(buffer.toByteArray());
});

function consume(buf) {
  const extract = cpio.extract();

  extract.on('entry', function(header, stream, callback) {
    console.log('entry event');
    stream.on('end', () => callback());
    stream.resume(); // auto drain
  });

  extract.on('finish', () => console.log('finish event'));

  const f = fs.createWriteStream('payload');
  sbuff(buf)
    .pipe(zlib.createGunzip())
    .pipe(extract);
}

function parse(bs) {
  const hs = {};

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

  // TODO 127?
  //pos += 3655 - 3528;
  // zlib header
  //assert(bs[pos] == 0x78);
  //assert(bs[pos + 1] == 0xDA);

  console.log(`cpio payload starts at position ${pos} (${pos.toString(16)})`);

  let fmt = ids.filter(e => e.stag === 'PAYLOADFORMAT')[0].value;
  let cmp = ids.filter(e => e.stag === 'PAYLOADCOMPRESSOR')[0].value;
  if (fmt == 'cpio' && cmp == 'gzip') {
    consume(new Buffer(bs.slice(pos)));
  } else {
    console.log(
      `Unsupported payload: Cannot process a ${cmp} compressed ${fmt}.`
    );
  }

  // console.log(`Complete header: ${JSON.stringify(hs)}`);
  return hs;
}
