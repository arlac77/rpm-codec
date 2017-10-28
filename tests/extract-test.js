import test from 'ava';
import { RPMStream } from '../src/stream';
import { TYPE_STRING } from '../src/types';

const fs = require('fs');
const path = require('path');

test.cb('extrat', t => {
  const stream = new RPMStream();

  //t.plan(7 + 1 + 2);

  let fieldsNumber = 0;

  stream.on('lead', lead => {
    t.is(lead.major, 3);
    t.is(lead.minor, 0);
    t.is(lead.signatureType, 5);
    t.is(lead.os, 1);
    //  t.is(lead.name, 'filesystem-3.2-40.fc26');
    //t.is(lead.arch, 19);
    t.is(lead.type, 0);
  });

  stream.on('signature', header => {
    //t.is(header.count, 8);
  });

  stream.on('header', header => {
    //t.is(header.count, 8);
  });

  stream.on('field', fields => {
    fieldsNumber++;
    //t.is(fields.size, 8);
    //t.is(fields.get('NAME').type, TYPE_STRING);

    //t.is(fields[0].type, 7);

    //console.log(fields);

    if (fieldsNumber === 2) {
      t.end();
    }
  });

  fs
    .createReadStream(
      path.join(
        __dirname,
        '..',
        'tests',
        'fixtures',
        'hello-2.3-1.el2.rf.i386.rpm'
        //'filesystem-3.2-40.fc26.aarch64.rpm'
        //'mktemp-1.6-4mdv2010.1.i586.rpm'
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
