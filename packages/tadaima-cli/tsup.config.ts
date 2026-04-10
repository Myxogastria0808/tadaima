import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  dts: false,
  clean: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});

