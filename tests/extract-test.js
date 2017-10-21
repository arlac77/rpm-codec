import test from 'ava';
import { RPMStream } from '../src/stream';

const fs = require('fs');
const path = require('path');

test.cb('simple unpack header', t => {
  const stream = new RPMStream();

  t.plan(7);

  stream.on('lead', lead => {
    t.is(lead.major, 3, 'major ok');
    t.is(lead.minor, 0, 'minor ok');
    t.is(lead.type, 1, 'type ok');
    t.is(lead.arch, 28011, 'type ok');
    t.is(lead.name, 'temp-1.6-4mdv2010.1', 'name ok');
    t.is(lead.os, 1, 'os ok');
    t.is(lead.signatureType, 5, 'signatureType ok');
    t.end();
  });

  fs
    .createReadStream(
      path.join(
        __dirname,
        '..',
        'tests',
        'fixtures',
        'mktemp-1.6-4mdv2010.1.i586.rpm'
      )
    )
    .pipe(stream);
});

test.cb('fail unpack invalid header', t => {
  const stream = new RPMStream();

  t.plan(1);

  stream.on('error', e => {
    t.pass('failed with ' + e);
    t.end();
  });

  fs
    .createReadStream(path.join(__dirname, '..', 'tests', 'extract-test.js'))
    .pipe(stream);
});
