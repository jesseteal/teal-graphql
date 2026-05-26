import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
    },
    {
      dir: 'dist',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [resolve(), typescript()],
};
