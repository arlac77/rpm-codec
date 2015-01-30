var rpm_stream = require('../lib/stream');
var fs = require('fs');
var path = require('path');

test('simple unpack', function() {
	var stream = rpm_stream();
	expect(1);

	stop();
	stream.on('header', function(header) {
		equal(1, 1, "is good");
		start();
	});

	fs.createReadStream(path.join(__dirname,
		'fixtures/mktemp-1.6-4mdv2010.1.i586.rpm')).pipe(stream);
});
