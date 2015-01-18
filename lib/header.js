// Contains information about the internal rpm structure such as lead, header, indices, payload, ...

"use strict";

var assert = require("assert");

// Utility: compare arrays
Array.prototype.equal = function (other) {
  return this.length == other.length && this.every(function (v, i) {
    return v === other[i];
  });
};

// [byte[] -> Number]
// Convert a byte buffer in base 10 into a number
var num = function(buf) {
    let base = 1;
    let result = 0;
    for (let i = buf.length - 1; i>=0; i--) {
        result += buf[i] * base;
        base *= 256;
    }
    return result;
}

var leadMagic = [237, 171, 238, 219];
var leadMajor = [3];
var leadMinor = [0];
var leadType = [0, 0, 0, 0];
var LEAD_LENGTH = 96;

var types = {
  NULL: 0,
  CHAR: 1,
  INT8: 2,
  INT16: 3,
  INT32: 4,
  INT64: 5,
  STRING: 6,
  BIN: 7,
  STRING_ARRAY: 8
};


// Return default lead buffer
function defaultLead() {
  var lead = [].concat.apply(leadMagic, leadMajor, leadMinor, leadType);
  while (lead.length < LEAD_LENGTH) lead.push(0);
  assert.equal(lead.length, LEAD_LENGTH);
  return lead;
}

// [ byte[] -> {} ]
/*
 struct rpmlead {
    unsigned char magic[4];
    unsigned char major, minor;
    short type;
    short archnum;
    char name[66];
    short osnum;
    short signature_type;
    char reserved[16];
 }
*/

var readLead = function(lead) {
  // Preconditions
  if (lead.length < LEAD_LENGTH) throw TypeError("Expecting at least " + LEAD_LENGTH + " bytes but got " + lead.length);
  if (!lead.slice(0, 4).equal(leadMagic)) throw TypeError("Bad magic, this is not a lead");

  return { magic: lead.slice(0, 4)
           , major: num(lead.slice(4, 5))
           , minor: num(lead.slice(5, 6))
           , type: num(lead.slice(6, 10))
           , signatureType: num(lead.slice(78, 80))
         };
}

// [ {:magic :major :minor :type} -> byte[] ]
var writeLead = function(attrs) {
  var defaults = { magic: leadMagic,
    major: leadMajor,
    minor: leadMinor,
    type: leadType };
    // TODO signatureType
  var merged = {};
  Object.assign(merged, attrs);

  // TODO copy pasted from defaultLead
  var lead = [].concat.apply(merged.magic, merged.major, merged.minor, merged.type);
  while (lead.length < LEAD_LENGTH) lead.push(0);

  // Postcondition
  assert.equal(lead.length, LEAD_LENGTH);
  return lead;
}

const headerStructureHeaderMagic = [ 0x8e, 0xad, 0xe8 ];
const headerStructureheaderLength = 16;

function readHeader(buf) {
    const MIN = 4
    // Preconditions
    // if (!typeof(buf) == []) throw TypeError(`Expecting [] but got ${typeof(buf)}`)
    if (buf.length < MIN) throw TypeError(`Illegal header, expecting at least ${MIN} bytes`)
    if (!buf.slice(0, 3).equal(headerStructureHeaderMagic)) throw TypeError("Bad magic, this is not a header");

    return { "magic": buf.slice(0, 3)
             , "version": buf.slice(3, 4)
             , "future": buf.slice(4, 8)
             , "count": num(buf.slice(8, 12))
             , "size": num(buf.slice(12, 16))
           };
}

const oneIndexSize = 16;
var readIndex = function(buf, n) {
    let indices = [];
    for (let i = 0; i<n; i++) {
        // Sliding buffer window
        let w = buf.slice(i*16, (i+1)*16);
        let tag = num(w.slice(0, 4));
        let type = num(w.slice(4, 8));
        let offset = num(w.slice(8, 12));
        let count = num(w.slice(12, 16));
        // console.log(`Index: tag=${tag}, type=${type}, offset=${offset}, count=${count}`);
        let index = {
            "tag": tag
            , "type": type
            , "offset": offset
            , "count": count
        }
        indices.push(index);
    }
    return indices;
}

const signatureTags = {
    HEADERSIGNATURES: 62 
    , BADSHA1_1: 264 
    , BADSHA1_2: 265 
    , DSA: 267 
    , RSA: 268 
    , SHA1: 269 
    , SIZE: 1000 
    , LEMD5_1: 1001 
    , PGP: 1002 
    , LEMD5_2: 1003 
    , MD5: 1004 
    , GPG: 1005 
    , PGP5: 1006 
    , PAYLOADSIZE: 1007 
};

// Source: http://rpm.org/api/4.4.2.2/rpmlib_8h.html
const headerTags = {
    // TODO add values < 1000 http://jrpm.sourceforge.net/rpmspec/
    RPMTAG_NAME: 1000, 
    RPMTAG_VERSION: 1001, 
    RPMTAG_RELEASE: 1002, 
    RPMTAG_EPOCH: 1003, 
    RPMTAG_SUMMARY: 1004, 
    RPMTAG_DESCRIPTION: 1005, 
    RPMTAG_BUILDTIME: 1006, 
    RPMTAG_BUILDHOST: 1007, 
    RPMTAG_INSTALLTIME: 1008, 
    RPMTAG_SIZE: 1009, 
    RPMTAG_DISTRIBUTION: 1010, 
    RPMTAG_VENDOR: 1011, 
    RPMTAG_GIF: 1012, 
    RPMTAG_XPM: 1013, 
    RPMTAG_LICENSE: 1014, 
    RPMTAG_PACKAGER: 1015, 
    RPMTAG_GROUP: 1016, 
    RPMTAG_CHANGELOG: 1017, 
    RPMTAG_SOURCE: 1018, 
    RPMTAG_PATCH: 1019, 
    RPMTAG_URL: 1020, 
    RPMTAG_OS: 1021, 
    RPMTAG_ARCH: 1022, 
    RPMTAG_PREIN: 1023, 
    RPMTAG_POSTIN: 1024, 
    RPMTAG_PREUN: 1025, 
    RPMTAG_POSTUN: 1026, 
    RPMTAG_OLDFILENAMES: 1027, 
    RPMTAG_FILESIZES: 1028, 
    RPMTAG_FILESTATES: 1029, 
    RPMTAG_FILEMODES: 1030, 
    RPMTAG_FILEUIDS: 1031, 
    RPMTAG_FILEGIDS: 1032, 
    RPMTAG_FILERDEVS: 1033, 
    RPMTAG_FILEMTIMES: 1034, 
    RPMTAG_FILEMD5S: 1035, 
    RPMTAG_FILELINKTOS: 1036, 
    RPMTAG_FILEFLAGS: 1037, 
    RPMTAG_ROOT: 1038, 
    RPMTAG_FILEUSERNAME: 1039, 
    RPMTAG_FILEGROUPNAME: 1040, 
    RPMTAG_EXCLUDE: 1041, 
    RPMTAG_EXCLUSIVE: 1042, 
    RPMTAG_ICON: 1043, 
    RPMTAG_SOURCERPM: 1044, 
    RPMTAG_FILEVERIFYFLAGS: 1045, 
    RPMTAG_ARCHIVESIZE: 1046, 
    RPMTAG_PROVIDENAME: 1047, 
    RPMTAG_REQUIREFLAGS: 1048, 
    RPMTAG_REQUIRENAME: 1049, 
    RPMTAG_REQUIREVERSION: 1050, 
    RPMTAG_NOSOURCE: 1051, 
    RPMTAG_NOPATCH: 1052, 
    RPMTAG_CONFLICTFLAGS: 1053, 
    RPMTAG_CONFLICTNAME: 1054, 
    RPMTAG_CONFLICTVERSION: 1055, 
    RPMTAG_DEFAULTPREFIX: 1056, 
    RPMTAG_BUILDROOT: 1057, 
    RPMTAG_INSTALLPREFIX: 1058, 
    RPMTAG_EXCLUDEARCH: 1059, 
    RPMTAG_EXCLUDEOS: 1060, 
    RPMTAG_EXCLUSIVEARCH: 1061, 
    RPMTAG_EXCLUSIVEOS: 1062, 
    RPMTAG_AUTOREQPROV: 1063, 
    RPMTAG_RPMVERSION: 1064, 
    RPMTAG_TRIGGERSCRIPTS: 1065, 
    RPMTAG_TRIGGERNAME: 1066, 
    RPMTAG_TRIGGERVERSION: 1067, 
    RPMTAG_TRIGGERFLAGS: 1068, 
    RPMTAG_TRIGGERINDEX: 1069, 
    RPMTAG_VERIFYSCRIPT: 1079, 
    RPMTAG_CHANGELOGTIME: 1080, 
    RPMTAG_CHANGELOGNAME: 1081, 
    RPMTAG_CHANGELOGTEXT: 1082, 
    RPMTAG_BROKENMD5: 1083, 
    RPMTAG_PREREQ: 1084, 
    RPMTAG_PREINPROG: 1085, 
    RPMTAG_POSTINPROG: 1086, 
    RPMTAG_PREUNPROG: 1087, 
    RPMTAG_POSTUNPROG: 1088, 
    RPMTAG_BUILDARCHS: 1089, 
    RPMTAG_OBSOLETENAME: 1090, 
    RPMTAG_VERIFYSCRIPTPROG: 1091, 
    RPMTAG_TRIGGERSCRIPTPROG: 1092, 
    RPMTAG_DOCDIR: 1093, 
    RPMTAG_COOKIE: 1094, 
    RPMTAG_FILEDEVICES: 1095, 
    RPMTAG_FILEINODES: 1096, 
    RPMTAG_FILELANGS: 1097, 
    RPMTAG_PREFIXES: 1098, 
    RPMTAG_INSTPREFIXES: 1099, 
    RPMTAG_TRIGGERIN: 1100, 
    RPMTAG_TRIGGERUN: 1101, 
    RPMTAG_TRIGGERPOSTUN: 1102, 
    RPMTAG_AUTOREQ: 1103, 
    RPMTAG_AUTOPROV: 1104, 
    RPMTAG_CAPABILITY: 1105, 
    RPMTAG_SOURCEPACKAGE: 1106, 
    RPMTAG_OLDORIGFILENAMES: 1107, 
    RPMTAG_BUILDPREREQ: 1108, 
    RPMTAG_BUILDREQUIRES: 1109, 
    RPMTAG_BUILDCONFLICTS: 1110, 
    RPMTAG_BUILDMACROS: 1111, 
    RPMTAG_PROVIDEFLAGS: 1112, 
    RPMTAG_PROVIDEVERSION: 1113, 
    RPMTAG_OBSOLETEFLAGS: 1114, 
    RPMTAG_OBSOLETEVERSION: 1115, 
    RPMTAG_DIRINDEXES: 1116, 
    RPMTAG_BASENAMES: 1117, 
    RPMTAG_DIRNAMES: 1118, 
    RPMTAG_ORIGDIRINDEXES: 1119, 
    RPMTAG_ORIGBASENAMES: 1120, 
    RPMTAG_ORIGDIRNAMES: 1121, 
    RPMTAG_OPTFLAGS: 1122, 
    RPMTAG_DISTURL: 1123, 
    RPMTAG_PAYLOADFORMAT: 1124, 
    RPMTAG_PAYLOADCOMPRESSOR: 1125, 
    RPMTAG_PAYLOADFLAGS: 1126, 
    RPMTAG_INSTALLCOLOR: 1127, 
    RPMTAG_INSTALLTID: 1128, 
    RPMTAG_REMOVETID: 1129, 
    RPMTAG_SHA1RHN: 1130, 
    RPMTAG_RHNPLATFORM: 1131, 
    RPMTAG_PLATFORM: 1132, 
    RPMTAG_PATCHESNAME: 1133, 
    RPMTAG_PATCHESFLAGS: 1134, 
    RPMTAG_PATCHESVERSION: 1135, 
    RPMTAG_CACHECTIME: 1136, 
    RPMTAG_CACHEPKGPATH: 1137, 
    RPMTAG_CACHEPKGSIZE: 1138, 
    RPMTAG_CACHEPKGMTIME: 1139, 
    RPMTAG_FILECOLORS: 1140, 
    RPMTAG_FILECLASS: 1141, 
    RPMTAG_CLASSDICT: 1142, 
    RPMTAG_FILEDEPENDSX: 1143, 
    RPMTAG_FILEDEPENDSN: 1144, 
    RPMTAG_DEPENDSDICT: 1145, 
    RPMTAG_SOURCEPKGID: 1146, 
    RPMTAG_FILECONTEXTS: 1147, 
    RPMTAG_FSCONTEXTS: 1148, 
    RPMTAG_RECONTEXTS: 1149, 
    RPMTAG_POLICIES: 1150, 
    RPMTAG_PRETRANS: 1151, 
    RPMTAG_POSTTRANS: 1152, 
    RPMTAG_PRETRANSPROG: 1153, 
    RPMTAG_POSTTRANSPROG: 1154, 
    RPMTAG_DISTTAG: 1155, 
    RPMTAG_SUGGESTSNAME: 1156, 
    RPMTAG_SUGGESTSVERSION: 1157, 
    RPMTAG_SUGGESTSFLAGS: 1158, 
    RPMTAG_ENHANCESNAME: 1159, 
    RPMTAG_ENHANCESVERSION: 1160, 
    RPMTAG_ENHANCESFLAGS: 1161, 
    RPMTAG_PRIORITY: 1162, 
    RPMTAG_CVSID: 1163
};


exports.defaultLead = defaultLead;
exports.readLead = readLead;
exports.writeLead = writeLead;

exports.readHeader = readHeader;
exports.readIndex = readIndex

exports.signatureTags = signatureTags;
exports.headerTags = headerTags;

// TODO remove testing scope
exports.num = num;
exports.types = types;
