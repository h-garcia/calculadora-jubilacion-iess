import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.js',
  outputDir: 'test-results/artifacts',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4173/', trace: 'retain-on-failure' },
  projects: [{
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  }],
  webServer: {
    command: 'npx http-server . -p 4173 -c-1 --silent',
    port: 4173,
    reuseExistingServer: true,
  },
});
