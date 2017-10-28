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

export function writeHeader() {}
