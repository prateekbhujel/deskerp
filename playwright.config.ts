import { defineConfig } from '@playwright/test';
import path from 'path';

const port = 8010;
const dbPath = path.join(process.cwd(), 'database', 'playwright.sqlite');
const env = [
    'APP_ENV=testing',
    'APP_URL=http://127.0.0.1:8010',
    'SESSION_DRIVER=file',
    'CACHE_STORE=array',
    'QUEUE_CONNECTION=sync',
    'DB_CONNECTION=sqlite',
    `DB_DATABASE="${dbPath}"`,
].join(' ');

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    retries: 0,
    reporter: 'list',
    use: {
        baseURL: `http://127.0.0.1:${port}`,
        headless: true,
        trace: 'retain-on-failure',
        testIdAttribute: 'data-testid',
    },
    webServer: {
        command: `zsh -lc 'mkdir -p database && rm -f "${dbPath}" && touch "${dbPath}" && ${env} php artisan migrate:fresh --seed --force && ${env} php artisan serve --host=127.0.0.1 --port=${port}'`,
        url: `http://127.0.0.1:${port}/login`,
        reuseExistingServer: false,
        timeout: 120000,
    },
});
