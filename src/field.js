export const FIELD = [
  { name: 'tag', type: 'u32be', length: 1 },
  { name: 'type', type: 'u32be', length: 1 },
  { name: 'offset', type: 'u32be', length: 1 },
  { name: 'count', type: 'u32be', length: 1 }
];

export function fieldDecode(buffer, field) {
  switch (field.type) {
    case 1:
      return buffer.toString('utf8', field.offset, field.count);
    case 2:
      return buffer.readUInt8(field.offset);
    case 4:
      return buffer.readUInt32LE(field.offset);
    case 6:
      return buffer.toString('utf8', field.offset, field.count);
    case 7:
      if (field.count > 1) {
        const a = new Uint8Array(field.count);
        for (let i = 0; i < field.count; i++) {
          a[i] = buffer.readUInt8(field.offset + i);
        }
        return a;
      }
      return buffer.readUInt8(field.offset);
  }
}
