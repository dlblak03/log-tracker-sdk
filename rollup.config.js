import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'es'
    },
    plugins: [nodeResolve()]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs'
    },
    plugins: [nodeResolve()]
  }
];