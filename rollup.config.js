import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import vue from 'rollup-plugin-vue';
import postcss from 'rollup-plugin-postcss';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.es.js',
      format: 'es',
      sourcemap: true,
    },
  ],
  external: ['vue', 'axios', 'spark-md5'],
  plugins: [
    vue(),
    typescript({
      tsconfig: './tsconfig.lib.json',
      declaration: true,
      declarationDir: 'dist',
    }),
    postcss({
      extract: false,
      modules: false,
      use: ['sass'],
    }),
    nodeResolve(),
    commonjs(),
  ],
});