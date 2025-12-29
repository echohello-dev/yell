import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    watch: false,
    include: ['src/**/__tests__/**/*.test.ts'],
  },
});
