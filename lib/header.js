// Contains information about the internal rpm structure such as lead, header, indices, payload, ...

"use strict"

var assert = require('assert');

// Utility: compare arrays
Array.prototype.equals = function(other) {
  return this.length == other.length && this.every(function(v, i) {
    return v === other[i]
  })
}

const leadMagic = [0xED, 0xAB, 0xEE, 0xDB];
const leadMajor = [3];
const leadMinor = [0];
const leadType = [0, 0, 0, 0];
const LEAD_LENGTH = 96;

const types = {
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
function defaultLead() {
  var lead = [].concat.apply(leadMagic, leadMajor, leadMinor, leadType)
  while (lead.length < LEAD_LENGTH) lead.push(0)
  assert.equal(lead.length, LEAD_LENGTH)
  return lead
}

// [ byte[] -> {} ]
function readLead(lead) {
    // Preconditions
    if (lead.length < LEAD_LENGTH) throw TypeError(`Expecting at least ${LEAD_LENGTH} bytes but got ${lead.length}`)
    if (!lead.slice(0, 4).equals(leadMagic)) throw TypeError('Bad magic, this is not a lead')

    return { "magic": lead.slice(0, 4)
             , "major": lead.slice(5, 5)
             , "minor": lead.slice(6, 6)
             , "type": lead.slice(7, 11)}
}

// [ {:magic :major :minor :type} -> byte[] ]
function writeLead(attrs) {
    const defaults = { 'magic': leadMagic
                     , 'major': leadMajor
                     , 'minor': leadMinor
                     , 'type': leadType };
    let merged = {};
    Object.assign(merged, attrs);

    // TODO copy pasted from defaultLead
    var lead = [].concat.apply(merged['magic']
                               , merged['major']
                               , merged['minor']
                               , merged['type']);
    while (lead.length < LEAD_LENGTH) lead.push(0);

    // Postcondition
    assert.equal(lead.length, LEAD_LENGTH);
    return lead;
}

console.log(readLead(defaultLead()));

exports.defaultLead = defaultLead;
exports.readLead = readLead;
exports.writeLead = writeLead;
