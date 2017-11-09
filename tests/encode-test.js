import test from 'ava';
import { RPMEncoder, RPMDecoder } from '../src/codec';

const fs = require('fs');
const path = require('path');

test.skip('RPMEncoder', async t => {
  const fileName = path.join(__dirname, '..', 'build', 'xxx.rpm');

  const output = fs.createWriteStream(fileName);

  await RPMEncoder(output, {
    name: 'mktemp-1.5-12sls',
    os: 'Linux',
    architecture: 'i586'
  });

  const input = fs.createReadStream(fileName);

  const result = await RPMDecoder(input);

  console.log(result.signature);
  t.is(result.lead.signatureType, 5);
});
