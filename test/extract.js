var rpm_stream = require('../lib/stream');
var fs = require('fs');
var path = require('path');

test('simple unpack header', function() {
	var stream = rpm_stream();
	expect(1);

	stop();
	stream.on('header', function(chunk) {
		ok(chunk.length >= 4, "is good");
		start();
	});

	fs.createReadStream(path.join(__dirname,
		'fixtures/mktemp-1.6-4mdv2010.1.i586.rpm')).pipe(stream);
});

test('fail unpack invalid header', function() {
	var stream = rpm_stream();
	expect(1);

	stop();
	stream.on('error', function(e) {
		ok(e, "failed with " + e);
		start();
	});

	fs.createReadStream(path.join(__dirname,
		'extract.js')).pipe(stream);
});
