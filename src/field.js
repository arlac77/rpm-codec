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

import { decodeStringArray, encodeStringArray } from './util';

export const FIELD = [
  { name: 'tag', type: 'u32be', length: 1 },
  { name: 'type', type: 'u32be', length: 1 },
  { name: 'offset', type: 'u32be', length: 1 },
  { name: 'count', type: 'u32be', length: 1 }
];

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
      return decodeStringArray(buffer, field.offset, 1, 'ascii')[0];
    case TYPE_STRING_ARRAY:
      return decodeStringArray(buffer, field.offset, field.count, 'ascii');
    case TYPE_I18NSTRING:
      return decodeStringArray(buffer, field.offset, field.count, 'utf8');
    case TYPE_BIN:
      return buffer.slice(field.offset, field.offset + field.count);
  }
}

export function fieldEncode(buffer, offset, field, value) {
  switch (field.type) {
    case TYPE_NULL:
      return 0;
    case TYPE_CHAR:
      //buffer.toString('ascii', field.offset, field.count);
      return 1;
    case TYPE_INT8:
      buffer.writeUInt8(offset, value);
      return 1;
    case TYPE_INT16:
      buffer.writeUInt16LE(offset, value);
      return 2;
    case TYPE_INT32:
      buffer.writeUInt32LE(offset);
      return 4;
    case TYPE_STRING:
      return encodeStringArray(buffer, offset, 'ascii', [value]);
    case TYPE_STRING_ARRAY:
      return encodeStringArray(buffer, offset, 'ascii', value);
    case TYPE_I18NSTRING:
      return encodeStringArray(buffer, offset, 'utf8', value);
    case TYPE_BIN:
    //return buffer.slice(field.offset, field.offset + field.count);
  }

  return 0;
}

export function fieldLength(field, value) {
  switch (field.type) {
    case TYPE_NULL:
      return 0;
    case TYPE_CHAR:
      return 1;
    case TYPE_INT8:
      return 1;
    case TYPE_INT16:
      return 2;
    case TYPE_INT32:
      return 4;
    case TYPE_INT64:
      return 8;
    case TYPE_STRING:
      return value.length + 1;
    case TYPE_STRING_ARRAY:
      return value.reduce((a, c) => a + c.length + 1, 0);
    case TYPE_I18NSTRING:
      return value.reduce((a, c) => a + c.length + 1, 0);
    case TYPE_BIN:
      return value.reduce((a, c) => a + c.length, 0);
  }
  return 0;
}
