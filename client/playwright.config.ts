import { defineConfig, devices } from '@playwright/test';

// The tests expect server to be running with the `local` profile on :8082
// (every request is authenticated as a fake user) and the MariaDB of the README to be available:
//   mvn -pl server spring-boot:run -Dspring-boot.run.profiles=local
// The dev server of the GUI (proxying to the server) is started here unless it is already running.
const port = 3004;

export default defineConfig({
    testDir: './e2e',
    globalSetup: './e2e/global-setup.ts',
    fullyParallel: false,
    workers: 1,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${port}`,
        testIdAttribute: 'data-testid',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: process.env.E2E_BASE_URL
        ? undefined
        : {
              command: 'yarn dev --port 3004 --no-open',
              url: `http://localhost:${port}`,
              reuseExistingServer: true,
              timeout: 120_000,
          },
});
