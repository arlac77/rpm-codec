/* jslint node: true, esnext: true */

// Contains information about the internal rpm structure such as lead, header, indices, payload, ...

"use strict";

var assert = require("assert");

// Utility: compare arrays
Array.prototype.equal = function(other) {
  return this.length == other.length && this.every(function(v, i) {
    return v === other[i];
  });
};

// [byte[] -> Number]
// Convert a byte buffer in base 10 into a number
var num = function(buf) {
  let base = 1;
  let result = 0;
  for (let i = buf.length - 1; i >= 0; i--) {
    result += buf[i] * base;
    base *= 256;
  }
  return result;
};

// [byte[] -> String]
// Convert an optionally 0-terminated byte array into a String
var str = function(buf) {
  let s = '';
  for (let i = 0; i < buf.length; i++) {
    let c = buf[i];
    if (c === 0) break;
    s += String.fromCharCode(c);
  }
  return s;
};

var leadMagic = [237, 171, 238, 219];
var leadMajor = [3];
var leadMinor = [0];
var leadType = [0, 0, 0, 0];
var LEAD_LENGTH = 96;

var types = {
  "NULL": 0,
  "CHAR": 1,
  "INT8": 2,
  "INT16": 3,
  "INT32": 4,
  "INT64": 5,
  "STRING": 6,
  "BIN": 7,
  "STRING_ARRAY": 8,

  0: "NULL",
  1: "CHAR",
  2: "INT8",
  3: "INT16",
  4: "INT32",
  5: "INT64",
  6: "STRING",
  7: "BIN",
  8: "STRING_ARRAY",
};

// Read a value from the RPM store identified by RPM index
var readStoreValue = function(store, index) {
  let buf = store.slice(index.offset, index.offset + index.count);
  let stype = types[index.type];
  console.log('readStoreValue(): type = ' + index.type + ', stype = ' + stype);
  let r;

  // Number?
  if (stype.startsWith("INT")) {
    // Remap count from bytes to corresponding type
    let n = stype.substring(3) / 8;
    r = num(store.slice(index.offset, index.offset + n));
    console.log("Read number from store:" + r);
  } else if (stype == types.CHAR || stype == types.STRING) {
    r = str(buf);
    console.log("Read string from store:" + r);
  } else {
    r = buf;
  }
  return r;
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
  if (lead.length < LEAD_LENGTH) {
    throw new TypeError("Expecting at least " + LEAD_LENGTH + " bytes but got " + lead.length);
  }
  if (!lead.slice(0, 4).equal(leadMagic)) {
    throw new TypeError("Bad magic, this is not a lead");
  }
  return {
    magic: lead.slice(0, 4),
    major: num(lead.slice(4, 5)),
    minor: num(lead.slice(5, 6)),
    type: num(lead.slice(6, 10)),
    arch: num(lead.slice(10, 12)),
    name: str(lead.slice(12, 76)),
    os: num(lead.slice(76, 78)),
    signatureType: num(lead.slice(78, 80))
  };
};

// [ {:magic :major :minor :type} -> byte[] ]
var writeLead = function(attrs) {
  var defaults = {
    magic: leadMagic,
    major: leadMajor,
    minor: leadMinor,
    type: leadType
  };
  // TODO signatureType
  var merged = {};
  Object.assign(merged, attrs);

  // TODO copy pasted from defaultLead
  var lead = [].concat.apply(merged.magic, merged.major, merged.minor, merged.type);
  while (lead.length < LEAD_LENGTH) lead.push(0);

  // Postcondition
  assert.equal(lead.length, LEAD_LENGTH);
  return lead;
};

const headerStructureHeaderMagic = [0x8e, 0xad, 0xe8];
const headerStructureHeaderLength = 16;

function readHeader(buf) {
  // Preconditions
  // if (!typeof(buf) == []) throw TypeError(`Expecting [] but got ${typeof(buf)}`)
  if (buf.length < headerStructureHeaderLength) {
    throw new TypeError(`Illegal header size, expecting ${headerStructureHeaderLength} bytes`);
  }
  if (!buf.slice(0, 3).equal(headerStructureHeaderMagic)) {
    throw new TypeError(`Bad header magic, expecting ${headerStructureHeaderMagic} but got ${buf.slice(0, 3)}`);
  }

  return {
    "magic": buf.slice(0, 3),
    "version": buf.slice(3, 4),
    "future": buf.slice(4, 8),
    "count": num(buf.slice(8, 12)),
    "size": num(buf.slice(12, 16))
  };
}

const oneIndexSize = 16;
// Read n indices from signature or header index
// TODO make this one a generator?
var readIndex = function(buf, n, tagTable) {
  let indices = [];
  for (let i = 0; i < n; i++) {
    // Sliding buffer window
    let w = buf.slice(i * oneIndexSize, (i + 1) * oneIndexSize);
    let tag = num(w.slice(0, 4));
    let type = num(w.slice(4, 8));
    let offset = num(w.slice(8, 12));
    let count = num(w.slice(12, 16));
    let index = {
      "tag": tag,
      "type": type,
      "offset": offset,
      "count": count,
      // Add human readable string represenatation for tag and type
      "stype": tagTable[type],
      "stag": tagTable[tag]
    };
    indices.push(index);
  }
  return indices;
};

var readSignatureIndex = function(buf, n) {
  return readIndex(buf, n, signatureTags);
};

var readHeaderIndex = function(buf, n) {
  return readIndex(buf, n, headerTags);
};

// Signatures and headers use a mod 8 byte size
var mod = function(m) {
  let x = m;
  while (x % 8 !== 0) x++;
  return x;
};

// [RPM Index -> int]
// Determine store size based on index
var storeSize = function(indices) {
  // Find largest offset
  let maxOff = 0;
  let n = 0;
  for (let i = indices.length; --i >= 0;) {
    let off = indices[i].offset;
    if (maxOff < off) {
      maxOff = off;
      n = indices[i].count;
    }
  }
  // Return largest offset + count for this entry % 8
  return mod(maxOff + n);
};

// [ indices[] -> store -> indices[] ]
// Enhance indices with store data from buffer
var readStore = function(ids, store) {
  // Show first signature incl. storage data
  for (let i = ids.length; --i >= 0;) {
    let v = readStoreValue(store, ids[i]);
    ids[i].value = v;
  }
  console.log(`Store enhanced signatures: ${JSON.stringify(ids)}`);
  return ids;
};

const signatureTags = {
  "HEADERSIGNATURES": 62,
  "BADSHA1_1": 264,
  "BADSHA1_2": 265,
  "DSA": 267,
  "RSA": 268,
  "SHA1": 269,
  "SIZE": 1000,
  "LEMD5_1": 1001,
  "PGP": 1002,
  "LEMD5_2": 1003,
  "MD5": 1004,
  "GPG": 1005,
  "PGP5": 1006,
  "PAYLOADSIZE": 1007,

  62: "HEADERSIGNATURES",
  264: "BADSHA1_1",
  265: "BADSHA1_2",
  267: "DSA",
  268: "RSA",
  269: "SHA1",
  1000: "SIZE",
  1001: "LEMD5_1",
  1002: "PGP",
  1003: "LEMD5_2",
  1004: "MD5",
  1005: "GPG",
  1006: "PGP5",
  1007: "PAYLOADSIZE"
};

// Source: http://rpm.org/api/4.4.2.2/rpmlib_8h.html
const headerTags = {
  "HEADERIMAGE": 61,
  "HEADERSIGNATURES": 62,
  "HEADERIMMUTABLE": 63,
  "HEADERREGIONS": 64,
  "HEADERI18NTABLE": 100,
  "SIG_BASE": 256,
  "SIGSIZE": 257,
  "SIGLEMD5_1": 258,
  "SIGPGP": 259,
  "SIGLEMD5_2": 260,
  "SIGMD5": 261,
  "SIGGPG": 262,
  "SIGPGP5": 263,
  "BADSHA1_1": 264,
  "BADSHA1_2": 265,
  "PUBKEYS": 266,
  "DSAHEADER": 267,
  "RSAHEADER": 268,
  "SHA1HEADER": 269,
  "NAME": 1000,
  "VERSION": 1001,
  "RELEASE": 1002,
  "EPOCH": 1003,
  "SUMMARY": 1004,
  "DESCRIPTION": 1005,
  "BUILDTIME": 1006,
  "BUILDHOST": 1007,
  "INSTALLTIME": 1008,
  "SIZE": 1009,
  "DISTRIBUTION": 1010,
  "VENDOR": 1011,
  "GIF": 1012,
  "XPM": 1013,
  "LICENSE": 1014,
  "PACKAGER": 1015,
  "GROUP": 1016,
  "CHANGELOG": 1017,
  "SOURCE": 1018,
  "PATCH": 1019,
  "URL": 1020,
  "OS": 1021,
  "ARCH": 1022,
  "PREIN": 1023,
  "POSTIN": 1024,
  "PREUN": 1025,
  "POSTUN": 1026,
  "OLDFILENAMES": 1027,
  "FILESIZES": 1028,
  "FILESTATES": 1029,
  "FILEMODES": 1030,
  "FILEUIDS": 1031,
  "FILEGIDS": 1032,
  "FILERDEVS": 1033,
  "FILEMTIMES": 1034,
  "FILEMD5S": 1035,
  "FILELINKTOS": 1036,
  "FILEFLAGS": 1037,
  "ROOT": 1038,
  "FILEUSERNAME": 1039,
  "FILEGROUPNAME": 1040,
  "EXCLUDE": 1041,
  "EXCLUSIVE": 1042,
  "ICON": 1043,
  "SOURCERPM": 1044,
  "FILEVERIFYFLAGS": 1045,
  "ARCHIVESIZE": 1046,
  "PROVIDENAME": 1047,
  "REQUIREFLAGS": 1048,
  "REQUIRENAME": 1049,
  "REQUIREVERSION": 1050,
  "NOSOURCE": 1051,
  "NOPATCH": 1052,
  "CONFLICTFLAGS": 1053,
  "CONFLICTNAME": 1054,
  "CONFLICTVERSION": 1055,
  "DEFAULTPREFIX": 1056,
  "BUILDROOT": 1057,
  "INSTALLPREFIX": 1058,
  "EXCLUDEARCH": 1059,
  "EXCLUDEOS": 1060,
  "EXCLUSIVEARCH": 1061,
  "EXCLUSIVEOS": 1062,
  "AUTOREQPROV": 1063,
  "RPMVERSION": 1064,
  "TRIGGERSCRIPTS": 1065,
  "TRIGGERNAME": 1066,
  "TRIGGERVERSION": 1067,
  "TRIGGERFLAGS": 1068,
  "TRIGGERINDEX": 1069,
  "VERIFYSCRIPT": 1079,
  "CHANGELOGTIME": 1080,
  "CHANGELOGNAME": 1081,
  "CHANGELOGTEXT": 1082,
  "BROKENMD5": 1083,
  "PREREQ": 1084,
  "PREINPROG": 1085,
  "POSTINPROG": 1086,
  "PREUNPROG": 1087,
  "POSTUNPROG": 1088,
  "BUILDARCHS": 1089,
  "OBSOLETENAME": 1090,
  "VERIFYSCRIPTPROG": 1091,
  "TRIGGERSCRIPTPROG": 1092,
  "DOCDIR": 1093,
  "COOKIE": 1094,
  "FILEDEVICES": 1095,
  "FILEINODES": 1096,
  "FILELANGS": 1097,
  "PREFIXES": 1098,
  "INSTPREFIXES": 1099,
  "TRIGGERIN": 1100,
  "TRIGGERUN": 1101,
  "TRIGGERPOSTUN": 1102,
  "AUTOREQ": 1103,
  "AUTOPROV": 1104,
  "CAPABILITY": 1105,
  "SOURCEPACKAGE": 1106,
  "OLDORIGFILENAMES": 1107,
  "BUILDPREREQ": 1108,
  "BUILDREQUIRES": 1109,
  "BUILDCONFLICTS": 1110,
  "BUILDMACROS": 1111,
  "PROVIDEFLAGS": 1112,
  "PROVIDEVERSION": 1113,
  "OBSOLETEFLAGS": 1114,
  "OBSOLETEVERSION": 1115,
  "DIRINDEXES": 1116,
  "BASENAMES": 1117,
  "DIRNAMES": 1118,
  "ORIGDIRINDEXES": 1119,
  "ORIGBASENAMES": 1120,
  "ORIGDIRNAMES": 1121,
  "OPTFLAGS": 1122,
  "DISTURL": 1123,
  "PAYLOADFORMAT": 1124,
  "PAYLOADCOMPRESSOR": 1125,
  "PAYLOADFLAGS": 1126,
  "INSTALLCOLOR": 1127,
  "INSTALLTID": 1128,
  "REMOVETID": 1129,
  "SHA1RHN": 1130,
  "RHNPLATFORM": 1131,
  "PLATFORM": 1132,
  "PATCHESNAME": 1133,
  "PATCHESFLAGS": 1134,
  "PATCHESVERSION": 1135,
  "CACHECTIME": 1136,
  "CACHEPKGPATH": 1137,
  "CACHEPKGSIZE": 1138,
  "CACHEPKGMTIME": 1139,
  "FILECOLORS": 1140,
  "FILECLASS": 1141,
  "CLASSDICT": 1142,
  "FILEDEPENDSX": 1143,
  "FILEDEPENDSN": 1144,
  "DEPENDSDICT": 1145,
  "SOURCEPKGID": 1146,
  "FILECONTEXTS": 1147,
  "FSCONTEXTS": 1148,
  "RECONTEXTS": 1149,
  "POLICIES": 1150,
  "PRETRANS": 1151,
  "POSTTRANS": 1152,
  "PRETRANSPROG": 1153,
  "POSTTRANSPROG": 1154,
  "DISTTAG": 1155,
  "SUGGESTSNAME": 1156,
  "SUGGESTSVERSION": 1157,
  "SUGGESTSFLAGS": 1158,
  "ENHANCESNAME": 1159,
  "ENHANCESVERSION": 1160,
  "ENHANCESFLAGS": 1161,
  "PRIORITY": 1162,
  "CVSID": 1163,

  61: "HEADERIMAGE",
  62: "HEADERSIGNATURES",
  63: "HEADERIMMUTABLE",
  64: "HEADERREGIONS",
  100: "HEADERI18NTABLE",
  256: "SIG_BASE",
  257: "SIGSIZE",
  258: "SIGLEMD5_1",
  259: "SIGPGP",
  260: "SIGLEMD5_2",
  261: "SIGMD5",
  262: "SIGGPG",
  263: "SIGPGP5",
  264: "BADSHA1_1",
  265: "BADSHA1_2",
  266: "PUBKEYS",
  267: "DSAHEADER",
  268: "RSAHEADER",
  269: "SHA1HEADER",
  1000: "NAME",
  1001: "VERSION",
  1002: "RELEASE",
  1003: "EPOCH",
  1004: "SUMMARY",
  1005: "DESCRIPTION",
  1006: "BUILDTIME",
  1007: "BUILDHOST",
  1008: "INSTALLTIME",
  1009: "SIZE",
  1010: "DISTRIBUTION",
  1011: "VENDOR",
  1012: "GIF",
  1013: "XPM",
  1014: "LICENSE",
  1015: "PACKAGER",
  1016: "GROUP",
  1017: "CHANGELOG",
  1018: "SOURCE",
  1019: "PATCH",
  1020: "URL",
  1021: "OS",
  1022: "ARCH",
  1023: "PREIN",
  1024: "POSTIN",
  1025: "PREUN",
  1026: "POSTUN",
  1027: "OLDFILENAMES",
  1028: "FILESIZES",
  1029: "FILESTATES",
  1030: "FILEMODES",
  1031: "FILEUIDS",
  1032: "FILEGIDS",
  1033: "FILERDEVS",
  1034: "FILEMTIMES",
  1035: "FILEMD5S",
  1036: "FILELINKTOS",
  1037: "FILEFLAGS",
  1038: "ROOT",
  1039: "FILEUSERNAME",
  1040: "FILEGROUPNAME",
  1041: "EXCLUDE",
  1042: "EXCLUSIVE",
  1043: "ICON",
  1044: "SOURCERPM",
  1045: "FILEVERIFYFLAGS",
  1046: "ARCHIVESIZE",
  1047: "PROVIDENAME",
  1048: "REQUIREFLAGS",
  1049: "REQUIRENAME",
  1050: "REQUIREVERSION",
  1051: "NOSOURCE",
  1052: "NOPATCH",
  1053: "CONFLICTFLAGS",
  1054: "CONFLICTNAME",
  1055: "CONFLICTVERSION",
  1056: "DEFAULTPREFIX",
  1057: "BUILDROOT",
  1058: "INSTALLPREFIX",
  1059: "EXCLUDEARCH",
  1060: "EXCLUDEOS",
  1061: "EXCLUSIVEARCH",
  1062: "EXCLUSIVEOS",
  1063: "AUTOREQPROV",
  1064: "RPMVERSION",
  1065: "TRIGGERSCRIPTS",
  1066: "TRIGGERNAME",
  1067: "TRIGGERVERSION",
  1068: "TRIGGERFLAGS",
  1069: "TRIGGERINDEX",
  1079: "VERIFYSCRIPT",
  1080: "CHANGELOGTIME",
  1081: "CHANGELOGNAME",
  1082: "CHANGELOGTEXT",
  1083: "BROKENMD5",
  1084: "PREREQ",
  1085: "PREINPROG",
  1086: "POSTINPROG",
  1087: "PREUNPROG",
  1088: "POSTUNPROG",
  1089: "BUILDARCHS",
  1090: "OBSOLETENAME",
  1091: "VERIFYSCRIPTPROG",
  1092: "TRIGGERSCRIPTPROG",
  1093: "DOCDIR",
  1094: "COOKIE",
  1095: "FILEDEVICES",
  1096: "FILEINODES",
  1097: "FILELANGS",
  1098: "PREFIXES",
  1099: "INSTPREFIXES",
  1100: "TRIGGERIN",
  1101: "TRIGGERUN",
  1102: "TRIGGERPOSTUN",
  1103: "AUTOREQ",
  1104: "AUTOPROV",
  1105: "CAPABILITY",
  1106: "SOURCEPACKAGE",
  1107: "OLDORIGFILENAMES",
  1108: "BUILDPREREQ",
  1109: "BUILDREQUIRES",
  1110: "BUILDCONFLICTS",
  1111: "BUILDMACROS",
  1112: "PROVIDEFLAGS",
  1113: "PROVIDEVERSION",
  1114: "OBSOLETEFLAGS",
  1115: "OBSOLETEVERSION",
  1116: "DIRINDEXES",
  1117: "BASENAMES",
  1118: "DIRNAMES",
  1119: "ORIGDIRINDEXES",
  1120: "ORIGBASENAMES",
  1121: "ORIGDIRNAMES",
  1122: "OPTFLAGS",
  1123: "DISTURL",
  1124: "PAYLOADFORMAT",
  1125: "PAYLOADCOMPRESSOR",
  1126: "PAYLOADFLAGS",
  1127: "INSTALLCOLOR",
  1128: "INSTALLTID",
  1129: "REMOVETID",
  1130: "SHA1RHN",
  1131: "RHNPLATFORM",
  1132: "PLATFORM",
  1133: "PATCHESNAME",
  1134: "PATCHESFLAGS",
  1135: "PATCHESVERSION",
  1136: "CACHECTIME",
  1137: "CACHEPKGPATH",
  1138: "CACHEPKGSIZE",
  1139: "CACHEPKGMTIME",
  1140: "FILECOLORS",
  1141: "FILECLASS",
  1142: "CLASSDICT",
  1143: "FILEDEPENDSX",
  1144: "FILEDEPENDSN",
  1145: "DEPENDSDICT",
  1146: "SOURCEPKGID",
  1147: "FILECONTEXTS",
  1148: "FSCONTEXTS",
  1149: "RECONTEXTS",
  1150: "POLICIES",
  1151: "PRETRANS",
  1152: "POSTTRANS",
  1153: "PRETRANSPROG",
  1154: "POSTTRANSPROG",
  1155: "DISTTAG",
  1156: "SUGGESTSNAME",
  1157: "SUGGESTSVERSION",
  1158: "SUGGESTSFLAGS",
  1159: "ENHANCESNAME",
  1160: "ENHANCESVERSION",
  1161: "ENHANCESFLAGS",
  1162: "PRIORITY",
  1163: "CVSID"
};

exports.defaultLead = defaultLead;
exports.readLead = readLead;
exports.writeLead = writeLead;

exports.LEAD_LENGTH = LEAD_LENGTH;
exports.headerStructureHeaderLength = headerStructureHeaderLength;
exports.readHeader = readHeader;
exports.readSignatureIndex = readSignatureIndex;
exports.readHeaderIndex = readHeaderIndex;
exports.signatureTags = signatureTags;
exports.headerTags = headerTags;
exports.readStore = readStore;

// TODO remove testing scope
exports.num = num;
exports.types = types;
exports.storeSize = storeSize;