[![npm](https://img.shields.io/npm/v/rpm-codec.svg)](https://www.npmjs.com/package/rpm-codec)
[![Greenkeeper](https://badges.greenkeeper.io/arlac77/rpm-codec.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/arlac77/rpm-codec)
[![Build Status](https://secure.travis-ci.org/arlac77/rpm-codec.png)](http://travis-ci.org/arlac77/rpm-codec)
[![bithound](https://www.bithound.io/github/arlac77/rpm-codec/badges/score.svg)](https://www.bithound.io/github/arlac77/rpm-codec)
[![codecov.io](http://codecov.io/github/arlac77/rpm-codec/coverage.svg?branch=master)](http://codecov.io/github/arlac77/rpm-codec?branch=master)
[![Coverage Status](https://coveralls.io/repos/arlac77/rpm-codec/badge.svg)](https://coveralls.io/r/arlac77/rpm-codec)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/rpm-codec/badge.svg)](https://snyk.io/test/github/arlac77/rpm-codec)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/rpm-codec.svg?style=flat-square)](https://github.com/arlac77/rpm-codec/issues)
[![Stories in Ready](https://badge.waffle.io/arlac77/rpm-codec.svg?label=ready&title=Ready)](http://waffle.io/arlac77/rpm-codec)
[![Dependency Status](https://david-dm.org/arlac77/rpm-codec.svg)](https://david-dm.org/arlac77/rpm-codec)
[![devDependency Status](https://david-dm.org/arlac77/rpm-codec/dev-status.svg)](https://david-dm.org/arlac77/rpm-codec#info=devDependencies)
[![docs](http://inch-ci.org/github/arlac77/rpm-codec.svg?branch=master)](http://inch-ci.org/github/arlac77/rpm-codec)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![downloads](http://img.shields.io/npm/dm/rpm-codec.svg?style=flat-square)](https://npmjs.org/package/rpm-codec)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)


rpm-codec
===
Encode/decode rpm lead/header(s)

== Which version of RPM is supported?

According to <<wikipedia>> there are, well, three versions of rpm:

1. 'THE' rpm
2. rpm.org, a public effort starting around 2007 producing versions 4.8 to 4.10
3. rpm v5 creating version 5

The first rpm i got my hand on was 4.4, so for now the one and only
implementation is 4.4.
Do _not_ expect any newer features such as compression other than gzip (lzma,
xz, ...).

RPM file format specification
===

RPM files are persisted in network byte order and consist of four parts.

Lead
===

Our lead looks like this:

magic (0-3)::
Magic value for both 'file' and rpm utilities ('ED AB EE DB')

major (4)::
RPM Major version ('03')

minor (5)::
RPM minor version ('00')

type (6-9)::
Type binary ('00 00 00 00').
Type source ('00 00 00 01') not supported yet.

deprecated (10-95)::
The rest is not used any more because its format is inflexible.
Content is superseded by the header.
It's only use is to support non-rpm utilities such as 'file' that can identify
rpms based on a magic value.
(85 times '00')

Signature
===

Signature format is equal to header format.
This lib does not support checksums because the order of the checksum field
would require the complete rpm structure to be processed before streaming could
continue.

Header
===

Supported index types:

- NULL = 0
- CHAR = 1
- INT8 = 2
- INT16 = 3
- INT32 = 4
- INT64 = 5
- STRING = 6
- BIN = 7
- STRING_ARRAY = 8

Payload
===

A gzip,xz compressed cpio structure carries the rpm payload. Other compressions
algorithms exist, and are supported by newer versions of 'rpm', but for now it's
gzip.

Bibliography
===

[bibliography]
- [wikipedia](http://en.wikipedia.org/wiki/RPM_Package_Manager)
RPM Package Manager
- _maxrpm_ Edward C. Bailey. Maximum rpm. Red Hat Software, Inc. 1997.
- [LSB Linux Base RPM File Format](http://refspecs.linuxbase.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/pkgformat.html)
- [cpio FreeBSD cpio (odc and newc) file format spec](http://people.freebsd.org/%7Ekientzle/libarchive/man/cpio.5.txt)
- [kernel Al Viro, H. Peter Anvin. initramfs buffer format. Linux Kernel. 2002](https://www.kernel.org/doc/Documentation/early-userspace/buffer-format.txt)
