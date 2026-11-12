import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  fullyParallel: false,
  timeout: 120000,
  expect: { timeout: 30000 },
  outputDir: ".data/browser-results",
  use: {
    baseURL: "http://localhost:3000",
    channel: "msedge",
    headless: true,
    trace: "off",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run preview",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
