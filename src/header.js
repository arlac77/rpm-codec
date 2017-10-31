import { FIELD, fieldEncode } from './field';
import { structDefaults, structLength, structEncode } from './util';

export const HEADER = [
  {
    name: 'magic',
    type: 'u8',
    length: 3,
    default: new Uint8Array([0x8e, 0xad, 0xe8])
  },
  { name: 'version', type: 'u8', length: 1, default: 1 },
  { name: 'reserved', type: 'void', length: 4 },
  { name: 'count', type: 'u32be', length: 1 },
  { name: 'size', type: 'u32be', length: 1 }
];

export function headerWithValues(values, tags) {
  const header = structDefaults(HEADER);
  const FIELDS = { type: FIELD, length: values.length };
  const fields = [];

  header.count = values.length;

  const hs = structLength(HEADER);
  const size = hs + structLength(FIELDS);

  const buffer = new Buffer(size + 10000);

  let offset = 0;
  for (const [key, value] of values.entries()) {
    const t = tags.get(key);

    const field = {
      tag: t.id,
      type: t.type,
      count: Array.isArray(value) ? value.length : 1,
      offset
    };

    const length = fieldEncode(buffer, offset, field, value);

    fields.push(field);

    offset += length;
  }

  header.size = 8;

  structEncode(header, buffer, 0, HEADER);
  structEncode(fields, buffer, hs, FIELDS);

  return buffer;
}
