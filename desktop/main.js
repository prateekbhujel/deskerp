const { app, BrowserWindow } = require('electron');
const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const host = '127.0.0.1';
const port = process.env.DESKPRO_PORT || '8000';
const startUrl = process.env.DESKPRO_START_URL || `http://${host}:${port}`;
const shouldManageServer = process.env.DESKPRO_SKIP_SERVER !== '1';

let mainWindow;
let phpProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 920,
        minWidth: 1180,
        minHeight: 760,
        backgroundColor: '#f1f5f9',
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadURL(startUrl);
}

function waitForServer(url, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const startedAt = Date.now();

        const attempt = () => {
            const request = http.get(url, (response) => {
                response.resume();
                resolve();
            });

            request.on('error', () => {
                if (Date.now() - startedAt >= timeoutMs) {
                    reject(new Error(`DeskPro server did not become available at ${url}`));
                    return;
                }

                setTimeout(attempt, 400);
            });
        };

        attempt();
    });
}

function startLaravelServer() {
    const projectRoot = path.resolve(__dirname, '..');
    const artisanPath = path.join(projectRoot, 'artisan');
    const phpBinary = process.env.DESKPRO_PHP_BINARY || (process.platform === 'win32' ? 'php.exe' : 'php');

    phpProcess = spawn(phpBinary, ['artisan', 'serve', `--host=${host}`, `--port=${port}`], {
        cwd: projectRoot,
        env: {
            ...process.env,
            APP_ENV: process.env.APP_ENV || 'production',
        },
        stdio: 'ignore',
    });

    phpProcess.on('exit', () => {
        phpProcess = null;
    });

    return artisanPath;
}

app.whenReady().then(async () => {
    if (shouldManageServer) {
        startLaravelServer();
        await waitForServer(startUrl);
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (phpProcess) {
        phpProcess.kill();
    }
});
