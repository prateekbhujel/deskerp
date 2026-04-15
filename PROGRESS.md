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
- Prioritize correctness and maintainability over visual polish
- Supplier ledger currently reflects opening balance and recorded payments made; purchase bill workflow is intentionally out of scope for this MVP pass.
- Electron wrapper is prepared in `desktop/` for the final Windows bundling stage, but a packaged Windows executable was not produced in this macOS browser-first build pass.
