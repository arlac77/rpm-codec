var rpm = require('../')

header = require('header');

module.exports = function(test) {

  test('simple lead', function(t) {
    t.plan(1)
    var l1 = lead()
    t.ok(l1.slice(0, 4).equals([0xED, 0xAB, 0xEE, 0xDB]))
  })

  // TODO test lead with bad length -> throw
  // TODO test lead with bad magic -> throw
}
