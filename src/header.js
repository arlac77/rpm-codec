
// Contains information about the internal rpm structure such as lead, header, indices, payload, ...

"use strict"

var assert = require('assert')

// Return default lead buffer
function lead() {
    var leadSize = 96
    var buf = new Buffer(leadSize)
    buf.fill(0)

    // magic
    buf[0] = 0xED
    buf[1] = 0xAB
    buf[2] = 0xEE
    buf[3] = 0xDB

    // major
    buf[4] = 3

    // minor
    buf[5] = 0

    // type
    buf[6] = 0
    buf[7] = 0
    buf[8] = 0
    buf[9] = 0

    return buf
}


var l1 = lead()
assert.equal(l1.slice(0, 3) == [ 0xED, 0xAB, 0xEE, 0xDB ])
