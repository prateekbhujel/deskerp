# DeskERP

DeskERP is a local-first accounting product for small business workflows. Laravel remains the backend source of truth for auth, invoicing, payments, inventory, reporting, PDF generation, and SQLite persistence, while the authenticated UI runs through Inertia.js + React + TypeScript + Ant Design. Browser-mode development on macOS stays first-class, and the Electron wrapper in `desktop/` remains available for the later Windows desktop bundle.

## Current Stack

- Laravel 12
- PHP 8.2+
- SQLite
- Inertia.js
- React 19 + TypeScript
- Ant Design
- Tailwind CSS
- `maatwebsite/excel` for XLSX export
- `barryvdh/laravel-dompdf` for invoice PDF output
- Electron wrapper in `desktop/`

## Current MVP Scope

- Session-based local auth with admin seed
- Customers, suppliers, units, categories, and items
- Pricing tiers, tax-ready item fields, and opening stock
- Sales invoices with draft/final states, remote search masters, printable view, and PDF download
- Payments received and payments made with invoice linking and overpayment protection
- Inventory movement and current stock updates from finalized invoices
- Sales, payments, inventory, customer ledger, and supplier ledger reports
- CSV and XLSX exports for reports
- Fiscal year settings for report defaults and numbering
- Setup wizard for business profile, fiscal year, and prefixes
- Optional Bikram Sambat date display with AD storage in SQLite
- Manual SQLite backup and restore

## Local Setup

1. Install PHP, Composer, Node.js, npm, and SQLite.
2. From the repo root, install dependencies:

```bash
composer install
npm install
```

3. Create `.env`, generate the app key, and create the SQLite file:

```bash
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
```

4. Run migrations and seed the app:

```bash
php artisan migrate --seed
```

5. Start DeskERP in browser mode:

```bash
php artisan serve
npm run dev
```

6. Open [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Default Admin Login

- Email: `admin@deskerp.local`
- Password: `deskerp123`

You can override the seeded admin in `.env`:

```env
DESKERP_ADMIN_NAME="DeskERP Admin"
DESKERP_ADMIN_EMAIL="admin@deskerp.local"
DESKERP_ADMIN_PASSWORD="deskerp123"
APP_VERSION="0.2.0"
```

## React + Inertia Notes

- The authenticated app shell lives in `resources/js/app.tsx`.
- React pages are under `resources/js/pages`.
- Shared React layout/components live in `resources/js/components`, `resources/js/hooks`, and `resources/js/lib`.
- Laravel controllers still own validation, persistence, numbering, stock updates, and exports.
- Quick-add customer/item modals reuse Laravel validation through JSON-aware controller responses.

## Nepali Calendar + Fiscal Year

- Turn BS display on from `Settings`.
- Dates are displayed in BS in the UI when enabled, but stored as AD ISO dates in the database.
- Fiscal year start/end values default report filters.
- Invoice/payment numbering now includes the configured fiscal year label for newly generated numbers.

## Reports and Exports

- Report pages support CSV and XLSX export with the active filters.
- Invoice print and PDF download continue to use the Laravel print/PDF flow.
- Ledger reports are paginated in the UI and export the full filtered dataset.

## Electron Wrapper

The desktop wrapper remains isolated in `desktop/`.

Install desktop dependencies from project root:

```bash
npm run desktop:install
```

Run Electron against an already-running local Laravel server from project root:

```bash
npm run desktop:dev
```

Run Electron with managed Laravel server startup from project root:

```bash
npm run desktop:dev:managed
```

Build the Windows portable package from project root:

```bash
npm run desktop:package:win
```

You can still run desktop commands directly inside `desktop/`:

```bash
cd desktop
npm install
npm run dev
npm run dev:managed
npm run package:win
```

## Useful Commands

```bash
php artisan migrate:fresh --seed
php artisan test
./vendor/bin/pint
npm run build
```

## Testing Coverage

DeskERP currently includes automated coverage for:

- Invoice calculations
- Payment outstanding-balance logic
- Stock behavior for draft vs final invoices
- Pricing tier resolution
- HTTP invoice creation flow
- HTTP payment creation linked to invoices
- Report CSV/XLSX export endpoints

## Out of Scope for This MVP

- Hosted backend services
- Sync, telemetry, analytics, or cloud backup
- Auto-update workflow
- Licensing or activation systems
