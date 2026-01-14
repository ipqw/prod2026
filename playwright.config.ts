import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.03,
            threshold: 0.07,
        },
    },
    testDir: './tests',
    snapshotDir: 'tests/snapshots',
    fullyParallel: true,
    retries: 1,
    workers: 5,
    timeout: 15000,
    reporter: [['line'], ['junit', {outputFile: 'test-results/results.xml'}]],
    use: {
        baseURL: 'http://127.0.0.1:8080',
        trace: 'on-first-retry',
        testIdAttribute: 'data-test-id',
    },
    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome']},
        },
    ],
    webServer: {
        command: 'npm run start',
        url: 'http://127.0.0.1:8080',
        reuseExistingServer: !process.env.CI,
    },
});
