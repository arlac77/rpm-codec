/**
 * Not Implemented
 */
export const TYPE_NULL = 0;
export const TYPE_CHAR = 1;
export const TYPE_INT8 = 2;
export const TYPE_INT16 = 3;
export const TYPE_INT32 = 4;
export const TYPE_INT64 = 5;

/**
 * variable, NUL terminated
 */
export const TYPE_STRING = 6;
export const TYPE_BIN = 7;

/**
 * Variable, sequence of NUL terminated strings
 */
export const TYPE_STRING_ARRAY = 8;

/**
 * Variable, sequence of NUL terminated strings
 */
export const TYPE_I18NSTRING = 9;

export const oses = [
  ['Linux'],
  ['Irix'],
  ['SunOS', 'SunOS5', 'SunOS4', 'solaris'],
  ['AmigaOS'],
  ['HP-UX', 'hpux10'],
  ['OSF1', 'osf4.0', 'osf3.2'],
  ['FreeBSD'],
  ['SCO_SV', 'SCO_SV3.2v5.0.2'],
  ['IRIX64'],
  ['NextStep'],
  ['BSD_OS', 'bsdi'],
  ['machten'],
  ['CYGWIN32_NT', 'cygwin32'],
  ['CYGWIN32_95'],
  ['UNIX_SV', 'MP_RAS'],
  ['MiNT', 'FreeMiNT'],
  ['OS/390'],
  ['VM/ESA'],
  ['Linux/390'],
  ['Linux/ESA'],
  ['darwin', 'macosx']
].reduce(listPrepare, new Map());

export const architectures = [
  [
    'athlon',
    'geode',
    'pentium4',
    'pentium3',
    'i686',
    'i586',
    'i486',
    'i386',
    'x86_64',
    'amd64',
    'ia32e'
  ]
].reduce(listPrepare, new Map());

function flagsPrepare(a, c) {
  const slot = { name: c, id: a.size + 1 };
  a.set(slot.id, slot);
  a.set(slot.name, slot);
  return a;
}

export const fileFlags = [
  'config',
  'doc',
  'dontuse',
  'missingok',
  'noreplace',
  'specfile',
  'ghost',
  'license',
  'readme',
  'exclude'
].reduce(flagsPrepare, new Map());

export const dependencyFlags = {
  LESS: 0x02,
  GREATER: 0x04,
  EQUAL: 0x08,
  PREREQ: 0x40,
  INTERP: 0x100,
  SCRIPT_PRE: 0x200,
  SCRIPT_POST: 0x400,
  SCRIPT_PREUN: 0x800,
  SCRIPT_POSTUN: 0x1000,
  RPMLIB: 0x1000000
};

// Source: http://rpm.org/api/4.4.2.2/rpmlib_8h.html

const headerTags = [
  {
    tag: 62,
    name: 'SIGNATURES',
    type: TYPE_BIN,
    count: 16,
    required: false
  },
  {
    tag: 63,
    name: 'IMMUTABLE',
    type: TYPE_BIN,
    count: 16,
    required: false
  },
  {
    tag: 100,
    name: 'I18NTABLE',
    type: TYPE_STRING_ARRAY,
    required: false
  }
];

export const signatureTags = [
  ...headerTags,
  {
    tag: 267,
    name: 'DSA',
    type: TYPE_BIN,
    count: 65,
    required: false
  },
  {
    tag: 268,
    name: 'RSA',
    type: TYPE_BIN,
    count: 1,
    required: false
  },
  {
    tag: 269,
    name: 'SHA1',
    type: TYPE_STRING,
    count: 1,
    required: false
  },
  {
    tag: 1000,
    name: 'SIZE',
    type: TYPE_INT32,
    count: 1,
    required: true
  },
  {
    tag: 1002,
    name: 'PGP',
    type: TYPE_BIN,
    count: 1,
    required: false
  },
  {
    tag: 1004,
    name: 'MD5',
    type: TYPE_BIN,
    count: 16,
    required: true
  },
  {
    tag: 1005,
    name: 'GPG',
    type: TYPE_BIN,
    count: 65,
    required: false
  },
  {
    tag: 1007,
    name: 'PAYLOADSIZE',
    type: TYPE_INT32,
    count: 1,
    required: false
  }
].reduce(tagPrepare, new Map());

export const tags = [
  ...headerTags,
  {
    tag: 1000,
    name: 'NAME',
    type: TYPE_STRING,
    required: true
  },
  {
    tag: 1001,
    name: 'VERSION',
    type: TYPE_STRING,
    required: true
  },
  {
    tag: 1002,
    name: 'RELEASE',
    type: TYPE_STRING,
    required: true
  },
  {
    tag: 1003,
    name: 'EPOCH'
  },
  {
    tag: 1004,
    name: 'SUMMARY',
    type: TYPE_I18NSTRING,
    required: true
  },
  {
    tag: 1005,
    name: 'DESCRIPTION',
    type: TYPE_I18NSTRING,
    required: true
  },
  {
    tag: 1006,
    name: 'BUILDTIME',
    type: TYPE_INT32
  },
  {
    tag: 1007,
    name: 'BUILDHOST',
    type: TYPE_STRING
  },
  {
    tag: 1008,
    name: 'INSTALLTIME'
  },
  {
    tag: 1009,
    name: 'SIZE',
    type: TYPE_INT32
  },
  {
    tag: 1010,
    name: 'DISTRIBUTION',
    type: TYPE_STRING
  },
  {
    tag: 1011,
    name: 'VENDOR',
    type: TYPE_STRING
  },
  {
    tag: 1012,
    name: 'GIF'
  },
  {
    tag: 1013,
    name: 'XPM'
  },
  {
    tag: 1014,
    name: 'LICENSE',
    type: TYPE_STRING,
    required: true
  },
  {
    tag: 1015,
    name: 'PACKAGER',
    type: TYPE_STRING
  },
  {
    tag: 1016,
    name: 'GROUP',
    type: TYPE_I18NSTRING,
    required: true
  },
  {
    tag: 1017,
    name: 'CHANGELOG'
  },
  {
    tag: 1018,
    name: 'SOURCE'
  },
  {
    tag: 1019,
    name: 'PATCH'
  },
  {
    tag: 1020,
    name: 'URL',
    type: TYPE_STRING
  },
  {
    tag: 1021,
    name: 'OS',
    type: TYPE_STRING
  },
  {
    tag: 1022,
    name: 'ARCH',
    type: TYPE_STRING
  },
  {
    tag: 1023,
    name: 'PREIN',
    type: TYPE_STRING
  },
  {
    tag: 1024,
    name: 'POSTIN',
    type: TYPE_STRING
  },
  {
    tag: 1025,
    name: 'PREUN',
    type: TYPE_STRING
  },
  {
    tag: 1026,
    name: 'POSTUN',
    type: TYPE_STRING
  },
  {
    tag: 1027,
    name: 'OLDFILENAMES',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1028,
    name: 'FILESIZES',
    type: TYPE_INT32
  },
  {
    tag: 1029,
    name: 'FILESTATES'
  },
  {
    tag: 1030,
    name: 'FILEMODES',
    type: TYPE_INT16
  },
  {
    tag: 1031,
    name: 'FILEUIDS'
  },
  {
    tag: 1032,
    name: 'FILEGIDS'
  },
  {
    tag: 1033,
    name: 'FILERDEVS',
    type: TYPE_INT16
  },
  {
    tag: 1034,
    name: 'FILEMTIMES',
    type: TYPE_INT32
  },
  {
    tag: 1035,
    name: 'FILEMD5S',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1036,
    name: 'FILELINKTOS',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1037,
    name: 'FILEFLAGS',
    type: TYPE_INT32
  },
  {
    tag: 1038,
    name: 'ROOT'
  },
  {
    tag: 1039,
    name: 'FILEUSERNAME',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1040,
    name: 'FILEGROUPNAME',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1041,
    name: 'EXCLUDE'
  },
  {
    tag: 1042,
    name: 'EXCLUSIVE'
  },
  {
    tag: 1043,
    name: 'ICON'
  },
  {
    tag: 1044,
    name: 'SOURCERPM',
    type: TYPE_STRING
  },
  {
    tag: 1045,
    name: 'FILEVERIFYFLAGS',
    type: TYPE_INT32
  },
  {
    tag: 1046,
    name: 'ARCHIVESIZE',
    type: TYPE_INT32
  },
  {
    tag: 1047,
    name: 'PROVIDENAME',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1048,
    name: 'REQUIREFLAGS',
    type: TYPE_INT32,
    required: true
  },
  {
    tag: 1049,
    name: 'REQUIRENAME',
    type: TYPE_STRING_ARRAY,
    required: true
  },
  {
    tag: 1050,
    name: 'REQUIREVERSION',
    type: TYPE_STRING_ARRAY,
    required: true
  },
  {
    tag: 1051,
    name: 'NOSOURCE'
  },
  {
    tag: 1052,
    name: 'NOPATCH'
  },
  {
    tag: 1053,
    name: 'CONFLICTFLAGS',
    type: TYPE_INT32
  },
  {
    tag: 1054,
    name: 'CONFLICTNAME',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1055,
    name: 'CONFLICTVERSION',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1056,
    name: 'DEFAULTPREFIX',
    type: 6
  },
  {
    tag: 1057,
    name: 'BUILDROOT',
    type: 6
  },
  {
    tag: 1058,
    name: 'INSTALLPREFIX',
    type: 6
  },
  {
    tag: 1059,
    name: 'EXCLUDEARCH',
    type: 6
  },
  {
    tag: 1060,
    name: 'EXCLUDEOS',
    type: 6
  },
  {
    tag: 1061,
    name: 'EXCLUSIVEARCH',
    type: 6
  },
  {
    tag: 1062,
    name: 'EXCLUSIVEOS',
    type: 6
  },
  {
    tag: 1063,
    name: 'AUTOREQPROV',
    type: 6
  },
  {
    tag: 1064,
    name: 'RPMVERSION',
    type: TYPE_STRING
  },
  {
    tag: 1065,
    name: 'TRIGGERSCRIPTS',
    type: 6
  },
  {
    tag: 1066,
    name: 'TRIGGERNAME',
    type: 6
  },
  {
    tag: 1067,
    name: 'TRIGGERVERSION',
    type: 6
  },
  {
    tag: 1068,
    name: 'TRIGGERFLAGS',
    type: 6
  },
  {
    tag: 1069,
    name: 'TRIGGERINDEX',
    type: 6
  },
  {
    tag: 1079,
    name: 'VERIFYSCRIPT',
    type: 6
  },
  {
    tag: 1080,
    name: 'CHANGELOGTIME',
    type: TYPE_INT32
  },
  {
    tag: 1081,
    name: 'CHANGELOGNAME',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1082,
    name: 'CHANGELOGTEXT',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1083,
    name: 'BROKENMD5',
    type: 6
  },
  {
    tag: 1084,
    name: 'PREREQ',
    type: 6
  },
  {
    tag: 1085,
    name: 'PREINPROG',
    type: TYPE_STRING
  },
  {
    tag: 1086,
    name: 'POSTINPROG',
    type: TYPE_STRING
  },
  {
    tag: 1087,
    name: 'PREUNPROG',
    type: TYPE_STRING
  },
  {
    tag: 1088,
    name: 'POSTUNPROG',
    type: TYPE_STRING
  },
  {
    tag: 1089,
    name: 'BUILDARCHS',
    type: 6
  },
  {
    tag: 1090,
    name: 'OBSOLETENAME',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1091,
    name: 'VERIFYSCRIPTPROG',
    type: 6
  },
  {
    tag: 1092,
    name: 'TRIGGERSCRIPTPROG',
    type: 6
  },
  {
    tag: 1093,
    name: 'DOCDIR',
    type: 6
  },
  {
    tag: 1094,
    name: 'COOKIE',
    type: TYPE_STRING
  },
  {
    tag: 1095,
    name: 'FILEDEVICES',
    type: TYPE_INT32
  },
  {
    tag: 1096,
    name: 'FILEINODES',
    type: TYPE_INT32
  },
  {
    tag: 1097,
    name: 'FILELANGS',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1098,
    name: 'PREFIXES',
    type: 6
  },
  {
    tag: 1099,
    name: 'INSTPREFIXES',
    type: 6
  },
  {
    tag: 1100,
    name: 'TRIGGERIN',
    type: 6
  },
  {
    tag: 1101,
    name: 'TRIGGERUN',
    type: 6
  },
  {
    tag: 1102,
    name: 'TRIGGERPOSTUN',
    type: 6
  },
  {
    tag: 1103,
    name: 'AUTOREQ',
    type: 6
  },
  {
    tag: 1104,
    name: 'AUTOPROV',
    type: 6
  },
  {
    tag: 1105,
    name: 'CAPABILITY',
    type: 6
  },
  {
    tag: 1106,
    name: 'SOURCEPACKAGE',
    type: 6
  },
  {
    tag: 1107,
    name: 'OLDORIGFILENAMES',
    type: 6
  },
  {
    tag: 1108,
    name: 'BUILDPREREQ',
    type: 6
  },
  {
    tag: 1109,
    name: 'BUILDREQUIRES',
    type: 6
  },
  {
    tag: 1110,
    name: 'BUILDCONFLICTS',
    type: 6
  },
  {
    tag: 1111,
    name: 'BUILDMACROS',
    type: 6
  },
  {
    tag: 1112,
    name: 'PROVIDEFLAGS',
    type: TYPE_INT32
  },
  {
    tag: 1113,
    name: 'PROVIDEVERSION',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1114,
    name: 'OBSOLETEFLAGS',
    type: TYPE_INT32
  },
  {
    tag: 1115,
    name: 'OBSOLETEVERSION',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1116,
    name: 'DIRINDEXES',
    type: TYPE_INT32
  },
  {
    tag: 1117,
    name: 'BASENAMES',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1118,
    name: 'DIRNAMES',
    type: TYPE_STRING_ARRAY
  },
  {
    tag: 1119,
    name: 'ORIGDIRINDEXES',
    type: 6
  },
  {
    tag: 1120,
    name: 'ORIGBASENAMES',
    type: 6
  },
  {
    tag: 1121,
    name: 'ORIGDIRNAMES',
    type: 6
  },
  {
    tag: 1122,
    name: 'OPTFLAGS',
    type: TYPE_INT32
  },
  {
    tag: 1123,
    name: 'DISTURL',
    type: TYPE_STRING
  },
  {
    tag: 1124,
    name: 'PAYLOADFORMAT',
    type: TYPE_STRING
  },
  {
    tag: 1125,
    name: 'PAYLOADCOMPRESSOR',
    type: TYPE_STRING
  },
  {
    tag: 1126,
    name: 'PAYLOADFLAGS',
    type: TYPE_STRING
  },
  {
    tag: 1127,
    name: 'INSTALLCOLOR',
    type: 6
  },
  {
    tag: 1128,
    name: 'INSTALLTID',
    type: 6
  },
  {
    tag: 1129,
    name: 'REMOVETID',
    type: 6
  },
  {
    tag: 1130,
    name: 'SHA1RHN',
    type: 6
  },
  {
    tag: 1131,
    name: 'RHNPLATFORM',
    type: TYPE_INT32
  },
  {
    tag: 1132,
    name: 'PLATFORM',
    type: TYPE_INT32
  },
  {
    tag: 1133,
    name: 'PATCHESNAME',
    type: 6
  },
  {
    tag: 1134,
    name: 'PATCHESFLAGS',
    type: 6
  },
  {
    tag: 1135,
    name: 'PATCHESVERSION',
    type: 6
  },
  {
    tag: 1136,
    name: 'CACHECTIME',
    type: 6
  },
  {
    tag: 1137,
    name: 'CACHEPKGPATH',
    type: 6
  },
  {
    tag: 1138,
    name: 'CACHEPKGSIZE',
    type: 6
  },
  {
    tag: 1139,
    name: 'CACHEPKGMTIME',
    type: 6
  },
  {
    tag: 1140,
    name: 'FILECOLORS',
    type: 6
  },
  {
    tag: 1141,
    name: 'FILECLASS',
    type: 6
  },
  {
    tag: 1142,
    name: 'CLASSDICT',
    type: 6
  },
  {
    tag: 1143,
    name: 'FILEDEPENDSX',
    type: 6
  },
  {
    tag: 1144,
    name: 'FILEDEPENDSN',
    type: 6
  },
  {
    tag: 1145,
    name: 'DEPENDSDICT',
    type: 6
  },
  {
    tag: 1146,
    name: 'SOURCEPKGID',
    type: 6
  },
  {
    tag: 1147,
    name: 'FILECONTEXTS',
    type: 6
  },
  {
    tag: 1148,
    name: 'FSCONTEXTS',
    type: 6
  },
  {
    tag: 1149,
    name: 'RECONTEXTS',
    type: 6
  },
  {
    tag: 1150,
    name: 'POLICIES',
    type: 6
  },
  {
    tag: 1151,
    name: 'PRETRANS',
    type: 6
  },
  {
    tag: 1152,
    name: 'POSTTRANS',
    type: 6
  },
  {
    tag: 1153,
    name: 'PRETRANSPROG',
    type: 6
  },
  {
    tag: 1154,
    name: 'POSTTRANSPROG',
    type: 6
  },
  {
    tag: 1155,
    name: 'DISTTAG',
    type: 6
  },
  {
    tag: 1156,
    name: 'SUGGESTSNAME',
    type: 6
  },
  {
    tag: 1157,
    name: 'SUGGESTSVERSION',
    type: 6
  },
  {
    tag: 1158,
    name: 'SUGGESTSFLAGS',
    type: 6
  },
  {
    tag: 1159,
    name: 'ENHANCESNAME',
    type: 6
  },
  {
    tag: 1160,
    name: 'ENHANCESVERSION',
    type: 6
  },
  {
    tag: 1161,
    name: 'ENHANCESFLAGS',
    type: 6
  },
  {
    tag: 1162,
    name: 'PRIORITY',
    type: 6
  },
  {
    tag: 1163,
    name: 'CVSID',
    type: 6
  }
].reduce(tagPrepare, new Map());

function tagPrepare(m, c) {
  m.set(c.tag, c);
  m.set(c.name, c);
  return m;
}

function listPrepare(a, c) {
  const slot = { name: c[0], id: a.size + 1, aliases: c };
  a.set(slot.id, slot);
  slot.aliases.forEach(n => a.set(n, slot));
  return a;
}
