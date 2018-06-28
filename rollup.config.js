import pkg from './package.json';

export default {
  input: pkg.module,
  external: ['fs', 'path', 'zlib', 'cpio-stream', 'lzma-native'],
  output: {
    file: pkg.main,
    format: 'cjs',
    interop: false
  }
};
