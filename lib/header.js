// Contains information about the internal rpm structure such as lead, header, indices, payload, ...

"use strict";

var assert = require("assert");

// Utility: compare arrays
Array.prototype.equal = function (other) {
  return this.length == other.length && this.every(function (v, i) {
    return v === other[i];
  });
};

// [byte[] -> Number]
// Convert a byte buffer in base 10 into a number
function num(buf) {
    let base = 1;
    let result = 0;
    for (let i = buf.length - 1; i>=0; i--) {
        result += buf[i] * base;
        base *= 256;
    }
    return result;
}

var leadMagic = [237, 171, 238, 219];
var leadMajor = [3];
var leadMinor = [0];
var leadType = [0, 0, 0, 0];
var LEAD_LENGTH = 96;

var types = {
  NULL: 0,
  CHAR: 1,
  INT8: 2,
  INT16: 3,
  INT32: 4,
  INT64: 5,
  STRING: 6,
  BIN: 7,
  STRING_ARRAY: 8
};


// Return default lead buffer
function defaultLead() {
  var lead = [].concat.apply(leadMagic, leadMajor, leadMinor, leadType);
  while (lead.length < LEAD_LENGTH) lead.push(0);
  assert.equal(lead.length, LEAD_LENGTH);
  return lead;
}

// [ byte[] -> {} ]
function readLead(lead) {
  // Preconditions
  if (lead.length < LEAD_LENGTH) throw TypeError("Expecting at least " + LEAD_LENGTH + " bytes but got " + lead.length);
  if (!lead.slice(0, 4).equal(leadMagic)) throw TypeError("Bad magic, this is not a lead");

  return { magic: lead.slice(0, 4),
    major: lead.slice(4, 5),
    minor: lead.slice(5, 6),
    type: lead.slice(6, 10) };
}

// [ {:magic :major :minor :type} -> byte[] ]
function writeLead(attrs) {
  var defaults = { magic: leadMagic,
    major: leadMajor,
    minor: leadMinor,
    type: leadType };
  var merged = {};
  Object.assign(merged, attrs);

  // TODO copy pasted from defaultLead
  var lead = [].concat.apply(merged.magic, merged.major, merged.minor, merged.type);
  while (lead.length < LEAD_LENGTH) lead.push(0);

  // Postcondition
  assert.equal(lead.length, LEAD_LENGTH);
  return lead;
}

const headerStructureHeaderMagic = [ 0x8e, 0xad, 0xe8 ];
const headerStructureheaderLength = 16;

function readHeader(buf) {
    const MIN = 4
    // Preconditions
    // if (!typeof(buf) == []) throw TypeError(`Expecting [] but got ${typeof(buf)}`)
    if (buf.length < MIN) throw TypeError(`Illegal header, expecting at least ${MIN} bytes`)
    if (!buf.slice(0, 3).equal(headerStructureHeaderMagic)) throw TypeError("Bad magic, this is not a header");

    return { "magic": buf.slice(0, 3)
             , "version": buf.slice(3, 4)
             , "future": buf.slice(4, 8)
             , "count": num(buf.slice(8, 12))
             , "size": num(buf.slice(12, 16))
           };
}

const oneIndexSize = 16;
function readIndex(buf, n) {

    let indices = [];
    for (let i = 0; i<n; i++) {
        // Sliding buffer window
        let w = buf.slice(i*16, (i+1)*16);
        let tag = num(w.slice(0, 4));
        let type = num(w.slice(4, 8));
        let offset = num(w.slice(8, 12));
        let count = num(w.slice(12, 16));
        // console.log(`Index: tag=${tag}, type=${type}, offset=${offset}, count=${count}`);
        let index = {
            "tag": tag
            , "type": type
            , "offset": offset
            , "count": count
        }
        indices.push(index);
    }
    return indices;
}


exports.defaultLead = defaultLead;
exports.readLead = readLead;
exports.writeLead = writeLead;

exports.readHeader = readHeader;
exports.readIndex = readIndex

// TODO remove testing scope
exports.num = num;
exports.types = types;
