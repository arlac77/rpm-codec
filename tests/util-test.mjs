import test from 'ava';
import {
  structLength,
  structDecode,
  structEncode,
  decodeStringArray,
  encodeStringArray
} from '../src/util.mjs';
import { FIELD } from '../src/field.mjs';

test('struct length u8', t => {
  t.is(1, structLength('u8'));
});

test('struct length u16be', t => {
  t.is(2, structLength('u16be'));
});

const STRUCT = [
  {
    name: 'u8array',
    type: 'u8',
    length: 4
  },
  { name: 'u8', type: 'u8', length: 1, default: 3 },
  { name: 'u16be', type: 'u16be', length: 1 },
  { name: 's66', type: 's', length: 2 },
  { name: 'void', type: 'void', length: 2 },
  { name: 'u32be', type: 'u32be', length: 1 }
];

test('struct length STRUCT', t => {
  t.is(4 + 1 + 1 * 2 + 2 + 2 + 4, structLength(STRUCT));
});

test('struct length STRUCT array', t => {
  const type = { type: STRUCT, length: 8 };
  t.is((4 + 1 + 1 * 2 + 2 + 2 + 4) * 8, structLength(type));
});

test('struct length FIELD array', t => {
  const FIELDS = { type: FIELD, length: 2 };
  t.is(16 * 2, structLength(FIELDS));
});

test('struct decode', t => {
  const b = Buffer.from([
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    65,
    66,
    9,
    10,
    11,
    12,
    13,
    14,
    15
  ]);
  const d = structDecode(b, 0, STRUCT);
  t.is(d.u8array[0], 0);
  t.is(d.u8array[1], 1);
  t.is(d.u8array[2], 2);
  t.is(d.u8array[3], 3);
  t.is(d.u8, 4);
  t.is(d.u16be, 5 * 256 + 6);
  t.is(d.s66, 'AB');
  t.is(d.u32be, 11 * 256 * 256 * 256 + 12 * 256 * 256 + 13 * 256 + 14);
});

test('structEncode', t => {
  const b = Buffer.from([
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    65,
    66,
    9,
    10,
    11,
    12,
    13,
    14,
    15
  ]);
  const d = structDecode(b, 0, STRUCT);
  const b1 = Buffer(15);
  structEncode(d, b1, 0, STRUCT);
  t.deepEqual(b.slice(0, 9), b1.slice(0, 9));
});

test('struct encode array', t => {
  const type = { type: [{ name: 'tag', type: 'u8', length: 1 }], length: 4 };
  const b = Buffer(4);
  structEncode([{ tag: 1 }, { tag: 2 }, { tag: 3 }, { tag: 4 }], b, 0, type);
  t.deepEqual(b, Buffer.from([1, 2, 3, 4]));
});

test('decode string array', t => {
  const buffer = Buffer.from([0, 0, 65, 66, 0, 67, 0, 68, 0]);
  t.deepEqual(['AB', 'C', 'D'], decodeStringArray(buffer, 2, 7, 'ascii'));
});

test('encode string array', t => {
  const buffer = new Buffer(9);
  encodeStringArray(buffer, 2, 'ascii', ['AB', 'C', 'D']);
  t.deepEqual(buffer, Buffer.from([0, 0, 65, 66, 0, 67, 0, 68, 0]));
});
