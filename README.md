[![npm](https://img.shields.io/npm/v/rpm-codec.svg)](https://www.npmjs.com/package/rpm-codec)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/rpm-codec)](https://bundlephobia.com/result?p=rpm-codec)
[![downloads](http://img.shields.io/npm/dm/rpm-codec.svg?style=flat-square)](https://npmjs.org/package/rpm-codec)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/rpm-codec.svg?style=flat-square)](https://github.com/arlac77/rpm-codec/issues)
[![Build Status](https://travis-ci.com/arlac77/rpm-codec.svg?branch=master)](https://travis-ci.com/arlac77/rpm-codec)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/arlac77/rpm-codec.git)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/rpm-codec/badge.svg)](https://snyk.io/test/github/arlac77/rpm-codec)
[![Coverage Status](https://coveralls.io/repos/arlac77/rpm-codec/badge.svg)](https://coveralls.io/r/arlac77/rpm-codec)

# rpm-codec

Encode/decode rpm lead/header(s)

== Which version of RPM is supported?

According to &lt;<wikipedia>> there are, well, three versions of rpm:

1.  'THE' rpm
2.  rpm.org, a public effort starting around 2007 producing versions 4.8 to 4.10
3.  rpm v5 creating version 5

The first rpm i got my hand on was 4.4, so for now the one and only
implementation is 4.4.
Do _not_ expect any newer features such as compression other than gzip (lzma,
xz, ...).

# RPM file format specification

RPM files are persisted in network byte order and consist of four parts.

# Lead

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

# Signature

Signature format is equal to header format.
This lib does not support checksums because the order of the checksum field
would require the complete rpm structure to be processed before streaming could
continue.

# Header

Supported index types:

-   NULL = 0
-   CHAR = 1
-   INT8 = 2
-   INT16 = 3
-   INT32 = 4
-   INT64 = 5
-   STRING = 6
-   BIN = 7
-   STRING_ARRAY = 8

# Payload

A gzip,xz compressed cpio structure carries the rpm payload. Other compressions
algorithms exist, and are supported by newer versions of 'rpm', but for now it's
gzip.

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [RPMHeader](#rpmheader)
    -   [Properties](#properties)
-   [RPMDecoder](#rpmdecoder)
    -   [Parameters](#parameters)
-   [defaultEntryHandler](#defaultentryhandler)
    -   [Parameters](#parameters-1)
-   [contentDecoder](#contentdecoder)
    -   [Parameters](#parameters-2)
-   [TYPE_NULL](#type_null)
-   [TYPE_STRING](#type_string)
-   [TYPE_STRING_ARRAY](#type_string_array)
-   [TYPE_I18NSTRING](#type_i18nstring)

## RPMHeader

decoded rpm header

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### Properties

-   `lead` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `signature` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `header` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

## RPMDecoder

Decodes the rpm header.

### Parameters

-   `stream` **[Stream](https://nodejs.org/api/stream.html)** 

Returns **[RPMHeader](#rpmheader)** 

## defaultEntryHandler

null handler simply skips content

### Parameters

-   `header` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** file header
-   `stream` **ReadStream** 
-   `callback` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** 

## contentDecoder

Decode the body part of an rpm stream

### Parameters

-   `result` **[RPMHeader](#rpmheader)** 
-   `entryHandler` **EntryHandler**  (optional, default `defaultEntryHandler`)

## TYPE_NULL

Not Implemented

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## TYPE_STRING

variable, NUL terminated

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## TYPE_STRING_ARRAY

Variable, sequence of NUL terminated strings

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## TYPE_I18NSTRING

Variable, sequence of NUL terminated strings

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

# Bibliography

[bibliography]

-   [wikipedia](http://en.wikipedia.org/wiki/RPM_Package_Manager)
    RPM Package Manager
-   _maxrpm_ Edward C. Bailey. Maximum rpm. Red Hat Software, Inc. 1997.
-   [LSB Linux Base RPM File Format](http://refspecs.linuxbase.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/pkgformat.html)
-   [cpio FreeBSD cpio (odc and newc) file format spec](http://people.freebsd.org/%7Ekientzle/libarchive/man/cpio.5.txt)
-   [kernel Al Viro, H. Peter Anvin. initramfs buffer format. Linux Kernel. 2002](https://www.kernel.org/doc/Documentation/early-userspace/buffer-format.txt)
