import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.ts',

  output: [
    {
      file: 'dist/es/index.js',
      format: 'es',
    },
    {
      file: 'dist/lib/index.js',
      format: 'cjs',
    },
  ],

  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      declaration: true,
      outDir: 'dist',
    }),
  ],

  watch: ['src'],
}
