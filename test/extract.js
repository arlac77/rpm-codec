var rpm_stream = require('../lib/stream');
var fs = require('fs');
var path = require('path');
var assert = require('assert')
var mocha = require('mocha')

describe('simple unpack header', function() {
	it('should work', function(done) {
		var stream = rpm_stream();
		// TODO expect(1);

		stream.on('lead', function(lead) {
			assert(lead.major === 3, "major ok");
			assert(lead.minor === 0, "minor ok");
			assert(lead.type === 1, "type ok");
			assert(lead.arch === 28011, "type ok");
			assert(lead.name === 'temp-1.6-4mdv2010.1', "name ok");
			assert(lead.os === 1, "os ok");
			assert(lead.signatureType === 5, "signatureType ok");
			done();
		});

		fs.createReadStream(path.join(__dirname,
			'fixtures/mktemp-1.6-4mdv2010.1.i586.rpm')).pipe(stream);
	});
});

describe('fail unpack invalid header', function() {
	it('should work', function(done) {
		var stream = rpm_stream();
		// TODO expect(1);

		stream.on('error', function(e) {
			assert(e, "failed with " + e);
			done();
		});

		fs.createReadStream(path.join(__dirname,
			'extract.js')).pipe(stream);
	});
});
