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
  const FIELDS = { type: FIELD, length: values.size };
  const fields = [];

  header.count = values.size;

  const hs = structLength(HEADER);

  let offset = 0;

  for (const [key, value] of values.entries()) {
    const t = tags.get(key);

    const field = {
      tag: t.id,
      type: t.type,
      count: Array.isArray(value) ? value.length : 1,
      offset,
      value
    };

    fields.push(field);

    offset += fieldLength(field, value);
  }

  const size = hs + structLength(FIELDS) + offset;
  console.log(`${hs} + ${structLength(FIELDS)} + ${offset}`);

  const buffer = new Buffer(size);

  //header.size = 8;

  structEncode(header, buffer, 0, HEADER);
  structEncode(fields, buffer, hs, FIELDS);
  fields.forEach(f => fieldEncode(buffer, f.offset + hs, f, f.value));

  return buffer;
}
