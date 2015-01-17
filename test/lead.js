var rpm = require('../');
var fs = require('fs');

header = require('header');

// Read existing rpm from local filesystem
function readRpmLead(filename) {
    fs.open(filename, 'r', function(status, fd) {
        if (status) {
            console.log(status.message);
            return;
        }
        let buffer = new Buffer(100);
        fs.read(fd, buffer, 0, 100, 0, function(err, num) {
            console.log(buffer.toString('urf-8', 0, num));
            return buffer;
        });
    });
}

module.exports = function(test) {

  test('simple lead', function(t) {
    t.plan(1)
    var l1 = lead()
    t.ok(l1.slice(0, 4).equals([0xED, 0xAB, 0xEE, 0xDB]))
  })

  // TODO test lead with bad length -> throw
  // TODO test lead with bad magic -> throw

  test('Read lead from rpm package', function(t) {
      t.plan(2);
      var l = readRpmLead('resources/s1.f1-1.0.0.0-1.x64_64.rpm');
      console.log(lead.readLead(l));
  });
}
