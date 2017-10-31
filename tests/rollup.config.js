const external = ['ava'];

export default [
  {
    input: 'tests/decode-test.js',
    output: {
      file: 'build/decode-test.js',
      format: 'cjs',
      sourcemap: true
    },
    external
  },
  {
    input: 'tests/encode-test.js',
    output: {
      file: 'build/encode-test.js',
      format: 'cjs',
      sourcemap: true
    },
    external
  },
  {
    input: 'tests/lead-test.js',
    output: {
      file: 'build/lead-test.js',
      format: 'cjs',
      sourcemap: true
    },
    external
  },
  {
    input: 'tests/util-test.js',
    output: {
      file: 'build/util-test.js',
      format: 'cjs',
      sourcemap: true
    },
    external
  },
  {
    input: 'tests/header-test.js',
    output: {
      file: 'build/header-test.js',
      format: 'cjs',
      sourcemap: true
    },
    external
  },
  {
    input: 'tests/types-test.js',
    output: {
      file: 'build/types-test.js',
      format: 'cjs',
      sourcemap: true
    },
    external
  }
];
