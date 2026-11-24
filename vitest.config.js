import { defineConfig } from 'vitest/config';

// Unit tests only; Playwright specs under tests/e2e are run by `npm run e2e`.
export default defineConfig({
  test: { include: ['tests/unit/**/*.test.js'] },
});
