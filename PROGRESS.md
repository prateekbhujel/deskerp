# DeskERP Progress

## Current Status
- [x] Repository inspected
- [x] Local toolchain checked
- [x] Laravel app scaffolded
- [x] SQLite configured
- [x] Authentication and admin seed ready
- [x] Masters module ready
- [x] Invoicing ready
- [x] Payments ready
- [x] Inventory ready
- [x] Reports, export, backup/restore ready
- [x] Windows desktop wrapper preparation ready

## Build Order
1. Phase 1: Scaffold Laravel, configure SQLite, add authentication, base layout, admin seeder, and confirm browser-mode development on macOS.
2. Phase 2: Build master data modules for customers, suppliers, items, units, categories, and pricing fields.
3. Phase 3: Build sales invoicing with calculation services, numbering, printable view, and PDF export.
4. Phase 4: Build payments and invoice outstanding balance logic.
5. Phase 5: Build inventory movement, stock updates, current stock view, and stock ledger.
6. Phase 6: Build reports, CSV export, PDF/print-friendly views, and backup/restore.
7. Phase 7: Add Windows desktop wrapper preparation while keeping the Laravel app usable in browser mode.

## Notes
- Product name in UI/docs: DeskERP
- Local-first MVP with SQLite
- Browser mode first, desktop packaging later
- UI refreshed to a compact desktop accounting workspace (consistent sidebar, action bar, dense forms/tables, setup guidance).
- Supplier ledger currently reflects opening balance and recorded payments made; purchase bill workflow is intentionally out of scope for this MVP pass.
- Electron wrapper is prepared in `desktop/` for the final Windows bundling stage, but a packaged Windows executable was not produced in this macOS browser-first build pass.

## 2026-04-17 UX/Flow Update
- [x] Unified React app shell and page density across invoicing, payments, inventory, pricing, and reporting.
- [x] Removed demo/marketing boilerplate texts from login/layout/dashboard areas.
- [x] Added setup completeness hints (business/fiscal config) and app version display in login/app shell.
- [x] Kept Laravel services/controllers as source of truth; no backend workflow rewrites.
- [x] Verified with `php artisan test`, `npm run build`, `npx tsc --noEmit`, and Playwright smoke.
