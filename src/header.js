
// Contains information about the internal rpm structure such as lead, header, indices, payload, ...

"use strict"

var assert = require('assert')

var leadMagic = [ 0xED, 0xAB, 0xEE, 0xDB ]
var leadMajor = [ 3 ]
var leadMinor = [ 0 ]
var leadType = [ 0, 0, 0, 0 ]

// Return default lead buffer
function lead() {
    var lead = [].concat.apply(leadMagic
		    , leadMajor
		    , leadMinor
		    , leadType)
    while (lead.length < 96) lead.push(0)
    assert.equal(lead.length, 96)
    return lead
}

// TODO
// TypeError: Cannot set property 'equals' of undefined
Array.prototope.equals = function(xs, ys) {
    xs.length==ys.length && xs.every(function(v,i) { return v === ys[i]})
}

var l1 = lead()
assert(l1.slice(0, 4).equals([ 0xED, 0xAB, 0xEE, 0xDB ]))
