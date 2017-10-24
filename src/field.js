import {
  TYPE_NULL,
  TYPE_CHAR,
  TYPE_INT8,
  TYPE_INT16,
  TYPE_INT32,
  TYPE_INT64,
  TYPE_STRING,
  TYPE_BIN,
  TYPE_STRING_ARRAY,
  TYPE_I18NSTRING
} from './types';

export const FIELD = [
  { name: 'tag', type: 'u32be', length: 1 },
  { name: 'type', type: 'u32be', length: 1 },
  { name: 'offset', type: 'u32be', length: 1 },
  { name: 'count', type: 'u32be', length: 1 }
];

function decodeStringArray(buffer, offset, count, encoding) {
  const values = [];

  let last = offset;

  for (let i = 0; i < length; i++) {
    if (buffer[offset + i] === 0) {
      values.push(buffer.toString(encoding, last, offset + i));
      last = offset + i;
    }
  }

  return values;
}

export function fieldDecode(buffer, field) {
  switch (field.type) {
    case TYPE_NULL:
      return undefined;
    case TYPE_CHAR:
      return buffer.toString('ascii', field.offset, field.count);
    case TYPE_INT8:
      return buffer.readUInt8(field.offset);
    case TYPE_INT16:
      return buffer.readUInt16LE(field.offset);
    case TYPE_INT32:
      return buffer.readUInt32LE(field.offset);
    case TYPE_STRING:
      return buffer.toString('ascii', field.offset, field.count);
    case TYPE_STRING_ARRAY:
      return decodeStringArray(buffer, field.offset, field.count, 'ascii');
    case TYPE_I18NSTRING:
      return decodeStringArray(buffer, field.offset, field.count, 'utf8');
    case TYPE_BIN:
      return buffer.slice(field.offset, field.offset + field.count);
  }
}

export function fieldEncode(buffer, offset, field) {}
