# DeskERP

DeskERP is a local-first accounting MVP built with Laravel, SQLite, Blade, and a lightweight browser-first workflow for macOS development. The core application is designed to stay usable in the browser during development and then be wrapped for Windows desktop delivery in the final packaging stage.

## MVP Scope

- Local admin login with session-based authentication
- Customers, suppliers, units, categories, and items
- Item pricing, tax-ready fields, and simple future-ready price tiers
- Sales invoices with draft/final states, totals, printable view, and PDF export
- Payments received and payments made
- Inventory opening stock, stock movements, auto stock updates from final invoices, and current stock tracking
- Sales, payment, inventory, customer ledger, and supplier ledger reports
- CSV export for reports
- Manual backup and restore with SQLite file copies

## Stack

- Laravel 12
- PHP 8.2+
- SQLite
- Blade + Tailwind CSS
- DOMPDF for invoice PDF export
- Electron wrapper preparation in `desktop/`

## Local Setup

1. Install PHP, Composer, Node.js, npm, and SQLite.
2. From the `desk` folder, install dependencies:

```bash
composer install
npm install
```

3. Create your environment file and application key:

```bash
cp .env.example .env
php artisan key:generate
```

4. Make sure the SQLite database file exists:

```bash
touch database/database.sqlite
```

5. Run migrations and seed the local admin plus reference data:

```bash
php artisan migrate --seed
```

6. Start the browser-mode app:

```bash
php artisan serve
npm run dev
```

7. Open [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Default Admin Login

- Email: `admin@deskerp.local`
- Password: `deskerp123`

You can override these in `.env` with:

```env
DESKERP_ADMIN_NAME="DeskERP Admin"
DESKERP_ADMIN_EMAIL="admin@deskerp.local"
DESKERP_ADMIN_PASSWORD="deskerp123"
```

## Useful Commands

```bash
php artisan migrate:fresh --seed
php artisan test
./vendor/bin/pint
npm run build
```

## Browser-First Workflow

- Develop the main app in the browser on macOS first.
- Keep all accounting logic inside the Laravel app.
- Keep desktop-specific code isolated inside `desktop/`.
- Do not introduce cloud-only dependencies for core operations.

## Reports and Exports

- Invoice PDF export is available from invoice detail pages.
- Report CSV export is available from the report pages.
- Print-friendly invoice output is available at the invoice print route.

## Backup and Restore

- Manual backups are stored as copied `.sqlite` files under `storage/app/backups`.
- Restore replaces the current database, so use it carefully.
- The UI requires typing `RESTORE` before replacement.

## Testing

The suite includes DeskERP-specific coverage for:

- Invoice calculations
- Payment outstanding balance logic
- Stock changes from final vs draft invoices
- Pricing tier behavior

## Desktop Preparation

The Electron preparation lives in `desktop/`.

- `desktop/main.js` can open the Laravel app in Electron
- `desktop/package.json` isolates desktop dependencies from the main Laravel app
- `desktop/README.md` explains the packaging approach for Windows

This repository does not include an updater, sync layer, hosted backend, analytics, or telemetry.
