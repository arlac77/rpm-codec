export const LEAD = [
  {
    name: "magic",
    type: "u8",
    length: 4,
    default: new Uint8Array([0xed, 0xab, 0xee, 0xdb])
  },
  { name: "major", type: "u8", length: 1, default: 3 },
  { name: "minor", type: "u8", length: 1, default: 0 },
  { name: "type", type: "u16be", length: 1 },
  { name: "arch", type: "u16be", length: 1 },
  { name: "name", type: "s", length: 66 },
  { name: "os", type: "u16be", length: 1, default: 1 },
  { name: "signatureType", type: "u16be", length: 1, default: 5 },
  { name: "reserved", type: "void", length: 16 }
];
