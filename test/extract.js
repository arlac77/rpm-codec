var rpm_stream = require('../lib/stream');
var fs = require('fs');
var path = require('path');

QUnit.test('simple unpack', function(assert) {
  console.log("assert: " + JSON.stringify(assert));
  var done = assert.async();
  var stream = rpm_stream();
  expect(1);

  stream.on('header', function(header) {
    equal(1, 1, "is good");
    done();
  });

  stream.on('error', function(error) {
    console.log("error");
    fail("error");
  });

  fs.createReadStream(path.join(__dirname,
    'fixtures/mktemp-1.6-4mdv2010.1.i586.rpm')).pipe(stream);
});
