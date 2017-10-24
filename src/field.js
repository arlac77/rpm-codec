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
    case TYPE_I18NSTRING:
      return buffer.toString('utf8', field.offset, field.count);
    case TYPE_BIN:
      return buffer.slice(field.offset, field.offset + field.count);
  }
}

export function fieldEncode(buffer, offset, field) {}
