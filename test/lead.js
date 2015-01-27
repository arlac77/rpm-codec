var rpm = require('../')


// TODO
// TypeError: Cannot set property 'equals' of undefined
Array.prototope.equals = function(xs, ys) {
  xs.length == ys.length && xs.every(function(v, i) {
    return v === ys[i]
  })
}

module.exports = function(test) {

  test('simple lead', function(t) {
    t.plan(1)
    var l1 = lead()
    t.ok(l1.slice(0, 4).equals([0xED, 0xAB, 0xEE, 0xDB]))
  })

}
