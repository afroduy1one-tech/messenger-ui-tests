const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',

    timeout: 30000,

    use: {
        baseURL: 'http://127.0.0.1:8000',
        headless: true,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure'
    },

    reporter: [['html', { open: 'never' }]],

    webServer: {
        command: 'python3 -m http.server 8000',
        url: 'http://127.0.0.1:8000',
        reuseExistingServer: !process.env.CI
    }
});