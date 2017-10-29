import test from 'ava';
import { RPMDecoder, contentDecoder } from '../src/stream';
import { TYPE_STRING } from '../src/types';

const fs = require('fs');
const path = require('path');

test('RPMDecoder', async t => {
  const input = fs.createReadStream(
    path.join(
      __dirname,
      '..',
      'tests',
      'fixtures',
      //'hello-2.3-1.el2.rf.i386.rpm'
      //'filesystem-3.2-40.fc26.aarch64.rpm'
      'mktemp-1.6-4mdv2010.1.i586.rpm'
    )
  );

  const header = await RPMDecoder(input);

  t.is(header.get('PAYLOADCOMPRESSOR'), 'lzma');

  input.pipe(contentDecoder(header));
});

test('fail RPMDecoder invalid header', async t => {
  const input = fs.createReadStream(
    path.join(__dirname, '..', 'tests', 'extract-test.js')
  );

  const error = await t.throws(RPMDecoder(input));
  t.is(
    error.message,
    'Bad magic, this is not a lead. Expecting 237,171,238,219 but got 105,109,112,111'
  );
});
