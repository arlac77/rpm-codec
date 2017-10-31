import test from 'ava';
import { RPMDecoder, contentDecoder } from '../src/codec';
import { TYPE_STRING } from '../src/types';

const fs = require('fs');
const path = require('path');

test('RPMDecoder lzma', async t => {
  const input = fs.createReadStream(
    path.join(
      __dirname,
      '..',
      'tests',
      'fixtures',
      'mktemp-1.6-4mdv2010.1.i586.rpm'
    )
  );

  const result = await RPMDecoder(input);

  t.is(result.header.values.get('PAYLOADCOMPRESSOR'), 'lzma');

  input.pipe(contentDecoder(result));
});

test('RPMDecoder gzip', async t => {
  const input = fs.createReadStream(
    path.join(
      __dirname,
      '..',
      'tests',
      'fixtures',
      'hello-2.3-1.el2.rf.i386.rpm'
    )
  );

  const result = await RPMDecoder(input);

  t.is(result.header.values.get('PAYLOADCOMPRESSOR'), 'gzip');

  input.pipe(contentDecoder(result));
});

function collectEntries() {}

test('RPMDecoder aarch64', async t => {
  const input = fs.createReadStream(
    path.join(
      __dirname,
      '..',
      'tests',
      'fixtures',
      'filesystem-3.2-40.fc26.aarch64.rpm'
    )
  );

  const result = await RPMDecoder(input);

  t.is(result.header.values.get('PAYLOADCOMPRESSOR'), 'xz');

  const files = new Set();

  const p = input.pipe(
    contentDecoder(result, (header, stream, callback) => {
      files.add(header.name);
      stream.on('end', () => callback());
      stream.resume();
    })
  );

  await new Promise((resolve, reject) => {
    p.on('end', () => resolve());
    p.on('error', err => reject(err));
  });

  t.true(files.has('./usr/src'));
});

test('fail RPMDecoder invalid header', async t => {
  const input = fs.createReadStream(
    path.join(__dirname, '..', 'tests', 'decode-test.js')
  );

  const error = await t.throws(RPMDecoder(input));
  t.is(
    error.message,
    'Bad magic, this is not a lead. Expecting 237,171,238,219 but got 105,109,112,111'
  );
});
