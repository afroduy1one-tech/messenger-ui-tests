const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 30000,

    use: {
        baseURL: 'http://127.0.0.1:8001',
        headless: true,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure'
    },

    reporter: [['html', { open: 'never' }]],

    webServer: {
        command: 'PORT=8001 MESSAGES_FILE=messages.test.json node server.js',
        url: 'http://127.0.0.1:8001',
        reuseExistingServer: false
    }
});
