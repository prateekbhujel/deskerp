# DeskERP Desktop Wrapper

This folder isolates the Electron wrapper from the main Laravel application.

## Current Purpose

- Keep browser-mode Laravel development untouched
- Provide a clean place for the final Windows desktop bundling stage
- Avoid mixing Electron dependencies into the main Laravel root package

## Development Modes

Preferred from the project root:

```bash
npm run desktop:install
npm run desktop:dev
```

Managed Laravel startup from root:

```bash
npm run desktop:dev:managed
```

Windows packaging from root:

```bash
npm run desktop:package:win
```

If Laravel is already running locally:

```bash
cd desktop
npm install
npm run dev
```

If you want Electron to launch `php artisan serve` for you:

```bash
cd desktop
npm install
npm run dev:managed
```

## Windows Packaging Direction

The practical low-budget path is:

1. Keep the Laravel app as the source of truth.
2. Bundle Electron as the desktop shell.
3. Bundle a portable PHP runtime for Windows.
4. Start Laravel locally from Electron on app launch.
5. Store the SQLite database locally on the client machine.

## Notes

- `main.js` is prepared to open DeskERP at `http://127.0.0.1:8000`.
- In development it can use the system PHP executable.
- For final Windows builds, point `DESKERP_PHP_BINARY` to the bundled PHP runtime.
- Packaging is intentionally isolated from the browser-first MVP so the accounting app can stay easy to develop.
