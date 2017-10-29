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
  header.count = values.length;

  for (const [key, values] of values.entries) {
  }

  header.size = 8;
  const buffer = new Buffer(structLength(HEADER));
  structEncode(header, buffer, 0, HEADER);

  return buffer;
}
