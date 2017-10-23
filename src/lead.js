import { byteArrayEqual, num, str } from './util';

export const LEAD_MAGIC = [237, 171, 238, 219];
const LEAD_MAJOR = [3];
const LEAD_MINOR = [0];
const LEAD_TYPE = [0, 0, 0, 0];
export const LEAD_LENGTH = 96;

export const LEAD = [
  {
    name: 'magic',
    type: 'u8',
    length: 4,
    default: new Uint8Array([0xed, 0xab, 0xee, 0xdb])
  },
  { name: 'major', type: 'u8', length: 1, default: 3 },
  { name: 'minor', type: 'u8', length: 1, default: 0 },
  { name: 'type', type: 'u16be', length: 1 },
  { name: 'arch', type: 'u16be', length: 1 },
  { name: 'name', type: 's', length: 66 },
  { name: 'os', type: 'u16be', length: 1 },
  { name: 'signatureType', type: 'u16be', length: 1 },
  { name: 'reserved', type: 'void', length: 16 }
];

// Return default lead buffer
export function defaultLead() {
  const lead = Array.concat.apply(
    LEAD_MAGIC,
    LEAD_MAJOR,
    LEAD_MINOR,
    LEAD_TYPE
  );
  while (lead.length < LEAD_LENGTH) lead.push(0);
  assert.equal(lead.length, LEAD_LENGTH);
  return lead;
}

export function readLead(lead) {
  // Preconditions
  if (lead.length < LEAD_LENGTH) {
    throw new TypeError(
      'Expecting at least ' + LEAD_LENGTH + ' bytes but got ' + lead.length
    );
  }
  if (!byteArrayEqual(LEAD_MAGIC, lead)) {
    throw new TypeError(
      'Bad magic, this is not a lead. Expecting ' +
        LEAD_MAGIC +
        ' but got ' +
        lead
    );
  }
  return {
    magic: lead.slice(0, 4),
    major: num(lead.slice(4, 5)),
    minor: num(lead.slice(5, 6)),
    type: num(lead.slice(6, 10)),
    arch: num(lead.slice(10, 12)),
    name: str(lead.slice(12, 76)),
    os: num(lead.slice(76, 78)),
    signatureType: num(lead.slice(78, 80))
  };
}

// [ {:magic :major :minor :type} -> byte[] ]
export function writeLead(attrs) {
  const defaults = {
    magic: LEAD_MAGIC,
    major: LEAD_MAJOR,
    minor: LEAD_MINOR,
    type: LEAD_TYPE
  };
  // TODO signatureType
  const merged = Object.assign({}, attrs);

  // TODO copy pasted from defaultLead
  const lead = Array.concat.apply(
    merged.magic,
    merged.major,
    merged.minor,
    merged.type
  );

  while (lead.length < LEAD_LENGTH) lead.push(0);

  // Postcondition
  assert.equal(lead.length, LEAD_LENGTH);
  return lead;
}
