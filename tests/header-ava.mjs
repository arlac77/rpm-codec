import test from 'ava';
import { HEADER } from '../src/header.mjs';
import {
  structEncode,
  structLength,
  structDefaults
} from '../src/util.mjs';

test('write header', t => {
  const header = structDefaults(HEADER);
  header.count = 7;
  header.size = 8;
  const buffer = Buffer.alloc(structLength(HEADER));
  structEncode(header, buffer, 0, HEADER);
  t.deepEqual(
    buffer.slice(0, 16),
    Buffer.from([
      0x8e,
      0xad,
      0xe8,
      0x01,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x00,
      0x07,
      0x00,
      0x00,
      0x00,
      0x08
    ])
  );
});
