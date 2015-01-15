
// Contains information about the internal rpm structure such as lead, header, indices, payload, ...

"use strict"

// Return default lead
function lead() {
    var buf = ne Buffer(96)
    buf[0] = 0xED
    buf[1] = 0xAB
    buf[2] = 0xEE
    buf[3] = 0xDB
}
