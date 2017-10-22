const external = ['ava'];

export default [
  {
    input: 'tests/extract-test.js',
    output: {
      file: 'build/extract-test.js',
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
    input: 'tests/header-test.js',
    output: {
      file: 'build/header-test.js',
      format: 'cjs',
      sourcemap: true
    },
    external
  }
];
