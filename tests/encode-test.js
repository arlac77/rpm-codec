import test from 'ava';
import { RPMEncoder, RPMDecoder } from '../src/codec';
import { join } from 'path';

import { createReadStream } from 'fs';

test.skip('RPMEncoder', async t => {
  const fileName = join(__dirname, '..', 'build', 'xxx.rpm');

  const output = createWriteStream(fileName);

  await RPMEncoder(output, {
    name: 'mktemp-1.5-12sls',
    os: 'Linux',
    architecture: 'i586'
  });

  const input = createReadStream(fileName);

  const result = await RPMDecoder(input);

  console.log(result.signature);
  t.is(result.lead.signatureType, 5);
});
