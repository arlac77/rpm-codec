import cleanup from 'rollup-plugin-cleanup';
import executable from 'rollup-plugin-executable';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
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
