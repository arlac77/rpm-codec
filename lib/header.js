// Contains information about the internal rpm structure such as lead, header, indices, payload, ...

"use strict"

var leadMagic = [0xED, 0xAB, 0xEE, 0xDB]
var leadMajor = [3]
var leadMinor = [0]
var leadType = [0, 0, 0, 0]


var types = {
  'NULL': 0,
  'CHAR': 1,
  'INT8': 2,
  'INT16': 3,
  'INT32': 4,
  'INT64': 5,
  'STRING': 6,
  'BIN': 7,
  'STRING_ARRAY': 8
};

// Return default lead buffer
function lead() {
  var lead = [].concat.apply(leadMagic, leadMajor, leadMinor, leadType)
  while (lead.length < 96) lead.push(0)
  assert.equal(lead.length, 96)
  return lead
}


exports.lead = lead;
