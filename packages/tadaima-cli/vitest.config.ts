/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      enabled: false,
      reporter: ['html'],
      include: ['src/**/*.ts'],
    },
    reporters: ['default', 'html'],
  },
});
