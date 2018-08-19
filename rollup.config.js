import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import pkg from './package.json';

export default {
  input: pkg.module,
  external: ['fs', 'path', 'zlib', 'cpio-stream', 'lzma-native'],
  plugins: [resolve(), commonjs(), cleanup()],

  output: {
    file: pkg.main,
    format: 'cjs',
    interop: false
  }
};
