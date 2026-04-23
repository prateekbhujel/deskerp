<?php

use App\Http\Controllers\BackupController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CompanySelectionController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\LookupController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UnitController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request) {
    if (! (bool) $request->session()->get('company_selected', false)) {
        return redirect()->route('company.select');
    }

    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::middleware('guest')->group(function (): void {
    Route::get('/company', [CompanySelectionController::class, 'index'])->name('company.select');
    Route::post('/company/select', [CompanySelectionController::class, 'select'])->name('company.select.store');
    Route::post('/company/setup', [CompanySelectionController::class, 'setup'])->name('company.setup');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::post('/company/change', [CompanySelectionController::class, 'change'])->name('company.change');

    Route::resource('customers', CustomerController::class);
    Route::resource('suppliers', SupplierController::class);
    Route::resource('units', UnitController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('items', ItemController::class);
    Route::resource('invoices', InvoiceController::class)->except('destroy');
    Route::delete('invoices/{invoice}', [InvoiceController::class, 'destroy'])
        ->middleware('role:admin')
        ->name('invoices.destroy');
    Route::get('invoices/{invoice}/print', [InvoiceController::class, 'print'])->name('invoices.print');
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'pdf'])->name('invoices.pdf');
    Route::resource('payments', PaymentController::class)->except('destroy');
    Route::delete('payments/{payment}', [PaymentController::class, 'destroy'])
        ->middleware('role:admin')
        ->name('payments.destroy');
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::patch('settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('settings/users', [SettingsController::class, 'storeUser'])->name('settings.users.store');
    Route::patch('settings/users/{user}', [SettingsController::class, 'updateUser'])->name('settings.users.update');

    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
    Route::get('reports/payments', [ReportController::class, 'payments'])->name('reports.payments');
    Route::get('reports/inventory', [ReportController::class, 'inventory'])->name('reports.inventory');
    Route::get('reports/customers/{customer}/ledger', [ReportController::class, 'customerLedger'])->name('reports.customers.ledger');
    Route::get('reports/suppliers/{supplier}/ledger', [ReportController::class, 'supplierLedger'])->name('reports.suppliers.ledger');

    Route::get('backups', [BackupController::class, 'index'])->name('backups.index');
    Route::get('backups/download', [BackupController::class, 'download'])->name('backups.download');
    Route::post('backups', [BackupController::class, 'store'])->name('backups.store');
    Route::post('backups/restore', [BackupController::class, 'restore'])->name('backups.restore');

    Route::prefix('api/lookups')->group(function (): void {
        Route::get('customers', [LookupController::class, 'customers'])->name('lookups.customers');
        Route::get('suppliers', [LookupController::class, 'suppliers'])->name('lookups.suppliers');
        Route::get('items', [LookupController::class, 'items'])->name('lookups.items');
        Route::get('open-invoices', [LookupController::class, 'openInvoices'])->name('lookups.open-invoices');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
