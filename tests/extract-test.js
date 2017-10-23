import test from 'ava';
import { RPMStream } from '../src/stream';

const fs = require('fs');
const path = require('path');

test.cb('simple unpack header', t => {
  const stream = new RPMStream();

  t.plan(7 + 1 + 2);

  stream.on('lead', lead => {
    t.is(lead.major, 3);
    t.is(lead.minor, 0);
    t.is(lead.signatureType, 5);
    t.is(lead.os, 1);
    t.is(lead.name, 'mktemp-1.6-4mdv2010.1');
    t.is(lead.arch, 1);
    t.is(lead.type, 0);
  });

  stream.on('header', header => {
    t.is(header.count, 7);
  });

  stream.on('field', fields => {
    t.is(fields.length, 7);
    t.is(fields[0].type, 7);

    console.log(fields);
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
    t.pass('failed with planed' + e);
    t.end();
  });

  fs
    .createReadStream(path.join(__dirname, '..', 'tests', 'extract-test.js'))
    .pipe(stream);
});
