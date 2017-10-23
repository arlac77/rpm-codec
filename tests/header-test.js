import test from 'ava';
import {
  INDEX_SLOT_SIZE,
  HEADER_LENGTH,
  readSignatureIndex,
  storeSize,
  readStore,
  readHeader,
  readHeaderIndex
} from '../src/header';

import { readLead, LEAD_LENGTH } from '../src/lead';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const sbuff = require('simple-bufferstream');
const cpio = require('cpio-stream');

// [ Buffer -> [] ]
Buffer.prototype.toByteArray = function() {
  return Array.prototype.slice.call(this, 0);
};

test.cb('Read header from rpm package', t => {
  const filename = path.join(
    __dirname,
    '..',
    'tests',
    'fixtures',
    'mktemp-1.5-12sls.i586.rpm'
  );
  const buffer = fs.readFileSync(filename);
  //console.log(`Read ${buffer.length} bytes`);
  parse(t, buffer.toByteArray());
});

function consume(t, buf) {
  const extract = cpio.extract();

  extract.on('entry', (header, stream, callback) => {
    console.log(`${header.name} : ${header.size}`);
    const { base } = path.parse(header.name);
    const f = fs.createWriteStream(path.join(__dirname, '..', 'build', base));
    stream.pipe(f);
    stream.on('end', () => callback());
    //stream.resume(); // auto drain
    //
    if (header.name === './usr/share/man/man1/mktemp.1.bz2') {
      t.pass();
      t.end();
    }
  });

  //extract.on('finish', () => console.log('finish event'));

  sbuff(buf)
    .pipe(zlib.createGunzip())
    .pipe(extract);
}

function parse(t, bs) {
  const hs = {};

  //console.log(`Reading lead`);

  // Read lead
  let pos = 0;
  let l = readLead(bs);
  //console.log(`- Read lead: ${JSON.stringify(l)}`);
  hs.lead = l;

  //console.log(`Reading signatures`);

  // Read signatures/header
  pos += LEAD_LENGTH;
  let m = readHeader(bs.slice(pos));

  // Read signatures/index
  pos += HEADER_LENGTH;
  let sigs = readSignatureIndex(bs.slice(pos), m.count);

  // Read signatures/store
  pos += INDEX_SLOT_SIZE * m.count;
  sigs = readStore(sigs, bs.slice(pos));
  hs.signatures = sigs;

  //console.log(`Reading header`);

  // Same for header now
  let signatureStoreSize = storeSize(sigs);
  pos += signatureStoreSize;
  m = readHeader(bs.slice(pos));
  pos += HEADER_LENGTH;
  let ids = readHeaderIndex(bs.slice(pos), m.count);
  pos += INDEX_SLOT_SIZE * m.count;

  //console.log(`Expected store position: ${pos} (${pos.toString(16)})`);

  ids = readStore(ids, bs.slice(pos));
  hs.header = ids;

  // Just for fun - forward into payload
  const headerStoreSize = storeSize(ids);
  pos += headerStoreSize;

  // TODO 127?
  //pos += 3655 - 3528;
  // zlib header
  //assert(bs[pos] == 0x78);
  //assert(bs[pos + 1] == 0xDA);

  //console.log(`cpio payload starts at position ${pos} (${pos.toString(16)})`);

  const fmt = ids.filter(e => e.stag === 'PAYLOADFORMAT')[0].value;
  const cmp = ids.filter(e => e.stag === 'PAYLOADCOMPRESSOR')[0].value;
  if (fmt == 'cpio' && cmp == 'gzip') {
    consume(t, new Buffer(bs.slice(pos)));
  } else {
    console.log(
      `Unsupported payload: Cannot process a ${cmp} compressed ${fmt}.`
    );
  }

  // console.log(`Complete header: ${JSON.stringify(hs)}`);
  return hs;
}
