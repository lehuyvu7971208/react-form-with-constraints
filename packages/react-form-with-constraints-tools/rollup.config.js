// @ts-check

import typescript from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';
import gzip from 'rollup-plugin-gzip';
import filesize from 'rollup-plugin-filesize';

const __PROD__ = process.env.NODE_ENV === 'production';

function outputFileName() {
  let fileName = `react-form-with-constraints-tools.${process.env.NODE_ENV}`;
  fileName += __PROD__ ? '.min.js' : '.js';
  return fileName;
}

export default {
  input: './src/index.ts',
  output: {
    file: `dist/${outputFileName()}`,
    name: 'ReactFormWithConstraintsTools',
    format: 'umd',
    sourcemap: true
  },

  external: ['react-form-with-constraints', 'react', 'prop-types'],
  globals: {
    'react-form-with-constraints': 'ReactFormWithConstraints',
    react: 'React',
    'prop-types': 'PropTypes'
  },

  plugins: [
    typescript({
      abortOnError: false,
      clean: true,
      tsconfigOverride: {compilerOptions: {noEmit: false, module: 'esnext', declaration: false}}
    }),
    __PROD__ && uglify(),
    gzip({algorithm: 'zopfli'}),
    filesize()
  ]
};
