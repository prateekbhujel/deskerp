<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Item;
use App\Models\Payment;
use App\Models\Supplier;
use App\Support\CsvExport;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ReportController extends Controller
{
    public function index(): View
    {
        return view('reports.index', [
            'customers' => Customer::query()->orderBy('name')->get(),
            'suppliers' => Supplier::query()->orderBy('name')->get(),
        ]);
    }

    public function sales(Request $request)
    {
        $query = Invoice::query()
            ->with('customer')
            ->where('status', 'final')
            ->when($request->filled('date_from'), fn ($inner) => $inner->whereDate('issue_date', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($inner) => $inner->whereDate('issue_date', '<=', $request->date('date_to')))
            ->when($request->filled('customer_id'), fn ($inner) => $inner->where('customer_id', $request->integer('customer_id')))
            ->when($request->filled('q'), function ($inner) use ($request): void {
                $term = $request->string('q');
                $inner->where(function ($nested) use ($term): void {
                    $nested->where('invoice_number', 'like', "%{$term}%")
                        ->orWhere('customer_name', 'like', "%{$term}%");
                });
            })
            ->orderByDesc('issue_date');

        if ($request->string('export') === 'csv') {
            return CsvExport::download(
                'deskpro-sales-report.csv',
                ['Date', 'Invoice', 'Customer', 'Subtotal', 'Discount', 'Tax', 'Total', 'Paid', 'Balance'],
                $query->get()->map(fn (Invoice $invoice) => [
                    $invoice->issue_date?->format('Y-m-d'),
                    $invoice->invoice_number,
                    $invoice->customer_name,
                    $invoice->subtotal,
                    $invoice->discount_total,
                    $invoice->tax_total,
                    $invoice->total,
                    $invoice->paid_total,
                    $invoice->balance_due,
                ]),
            );
        }

        $summaryQuery = clone $query;

        return view('reports.sales', [
            'invoices' => $query->paginate(20)->withQueryString(),
            'summary' => [
                'total_sales' => $summaryQuery->sum('total'),
                'total_tax' => (clone $summaryQuery)->sum('tax_total'),
                'total_balance' => (clone $summaryQuery)->sum('balance_due'),
            ],
            'customers' => Customer::query()->orderBy('name')->get(),
        ]);
    }

    public function payments(Request $request)
    {
        $query = Payment::query()
            ->with(['customer', 'supplier', 'invoice'])
            ->when($request->filled('date_from'), fn ($inner) => $inner->whereDate('payment_date', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($inner) => $inner->whereDate('payment_date', '<=', $request->date('date_to')))
            ->when($request->filled('direction'), fn ($inner) => $inner->where('direction', $request->string('direction')))
            ->when($request->filled('method'), fn ($inner) => $inner->where('method', $request->string('method')))
            ->orderByDesc('payment_date');

        if ($request->string('export') === 'csv') {
            return CsvExport::download(
                'deskpro-payment-report.csv',
                ['Date', 'Number', 'Direction', 'Party', 'Invoice', 'Method', 'Reference', 'Amount'],
                $query->get()->map(fn (Payment $payment) => [
                    $payment->payment_date?->format('Y-m-d'),
                    $payment->payment_number,
                    ucfirst($payment->direction),
                    $payment->customer?->name ?? $payment->supplier?->name,
                    $payment->invoice?->invoice_number,
                    $payment->method,
                    $payment->reference_number,
                    $payment->amount,
                ]),
            );
        }

        return view('reports.payments', [
            'payments' => $query->paginate(20)->withQueryString(),
            'summary' => [
                'received' => (clone $query)->where('direction', 'received')->sum('amount'),
                'made' => (clone $query)->where('direction', 'made')->sum('amount'),
            ],
        ]);
    }

    public function inventory(Request $request)
    {
        $query = Item::query()
            ->with(['unit', 'category'])
            ->when($request->filled('q'), function ($inner) use ($request): void {
                $term = $request->string('q');

                $inner->where(function ($nested) use ($term): void {
                    $nested->where('name', 'like', "%{$term}%")
                        ->orWhere('sku', 'like', "%{$term}%");
                });
            })
            ->when($request->filled('category_id'), fn ($inner) => $inner->where('category_id', $request->integer('category_id')))
            ->orderBy('name');

        if ($request->string('export') === 'csv') {
            return CsvExport::download(
                'deskpro-inventory-report.csv',
                ['SKU', 'Item', 'Category', 'Unit', 'Current Stock', 'Reorder Level', 'Base Price', 'Stock Value'],
                $query->get()->map(fn (Item $item) => [
                    $item->sku,
                    $item->name,
                    $item->category?->name,
                    $item->unit?->code,
                    $item->current_stock,
                    $item->reorder_level,
                    $item->base_price,
                    number_format((float) $item->current_stock * (float) $item->base_price, 2, '.', ''),
                ]),
            );
        }

        return view('reports.inventory', [
            'items' => $query->paginate(20)->withQueryString(),
            'summary' => [
                'tracked_items' => (clone $query)->where('track_inventory', true)->count(),
                'low_stock_items' => (clone $query)->whereColumn('current_stock', '<=', 'reorder_level')->where('reorder_level', '>', 0)->count(),
            ],
            'categories' => Category::query()->orderBy('name')->get(),
        ]);
    }

    public function customerLedger(Request $request, Customer $customer)
    {
        $entries = collect([
            [
                'date' => null,
                'type' => 'Opening Balance',
                'reference' => 'OPEN',
                'debit' => (float) $customer->opening_balance,
                'credit' => 0.0,
                'notes' => 'Opening customer balance',
            ],
        ])->merge(
            Invoice::query()
                ->where('customer_id', $customer->id)
                ->where('status', 'final')
                ->when($request->filled('date_from'), fn ($query) => $query->whereDate('issue_date', '>=', $request->date('date_from')))
                ->when($request->filled('date_to'), fn ($query) => $query->whereDate('issue_date', '<=', $request->date('date_to')))
                ->get()
                ->map(fn (Invoice $invoice) => [
                    'date' => $invoice->issue_date?->format('Y-m-d'),
                    'type' => 'Invoice',
                    'reference' => $invoice->invoice_number,
                    'debit' => (float) $invoice->total,
                    'credit' => 0.0,
                    'notes' => $invoice->reference_number,
                ]),
        )->merge(
            Payment::query()
                ->where('customer_id', $customer->id)
                ->where('direction', 'received')
                ->when($request->filled('date_from'), fn ($query) => $query->whereDate('payment_date', '>=', $request->date('date_from')))
                ->when($request->filled('date_to'), fn ($query) => $query->whereDate('payment_date', '<=', $request->date('date_to')))
                ->get()
                ->map(fn (Payment $payment) => [
                    'date' => $payment->payment_date?->format('Y-m-d'),
                    'type' => 'Payment Received',
                    'reference' => $payment->payment_number,
                    'debit' => 0.0,
                    'credit' => (float) $payment->amount,
                    'notes' => $payment->reference_number,
                ]),
        );

        $ledger = $this->runningLedger($entries);

        if ($request->string('export') === 'csv') {
            return CsvExport::download(
                'deskpro-customer-ledger.csv',
                ['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance', 'Notes'],
                $ledger->map(fn (array $entry) => [
                    $entry['date'],
                    $entry['type'],
                    $entry['reference'],
                    $entry['debit'],
                    $entry['credit'],
                    $entry['balance'],
                    $entry['notes'],
                ]),
            );
        }

        return view('reports.customer-ledger', compact('customer', 'ledger'));
    }

    public function supplierLedger(Request $request, Supplier $supplier)
    {
        $entries = collect([
            [
                'date' => null,
                'type' => 'Opening Balance',
                'reference' => 'OPEN',
                'debit' => (float) $supplier->opening_balance,
                'credit' => 0.0,
                'notes' => 'Opening supplier balance',
            ],
        ])->merge(
            Payment::query()
                ->where('supplier_id', $supplier->id)
                ->where('direction', 'made')
                ->when($request->filled('date_from'), fn ($query) => $query->whereDate('payment_date', '>=', $request->date('date_from')))
                ->when($request->filled('date_to'), fn ($query) => $query->whereDate('payment_date', '<=', $request->date('date_to')))
                ->get()
                ->map(fn (Payment $payment) => [
                    'date' => $payment->payment_date?->format('Y-m-d'),
                    'type' => 'Payment Made',
                    'reference' => $payment->payment_number,
                    'debit' => 0.0,
                    'credit' => (float) $payment->amount,
                    'notes' => $payment->reference_number,
                ]),
        );

        $ledger = $this->runningLedger($entries);

        if ($request->string('export') === 'csv') {
            return CsvExport::download(
                'deskpro-supplier-ledger.csv',
                ['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance', 'Notes'],
                $ledger->map(fn (array $entry) => [
                    $entry['date'],
                    $entry['type'],
                    $entry['reference'],
                    $entry['debit'],
                    $entry['credit'],
                    $entry['balance'],
                    $entry['notes'],
                ]),
            );
        }

        return view('reports.supplier-ledger', compact('supplier', 'ledger'));
    }

    private function runningLedger(Collection $entries): Collection
    {
        $balance = 0.0;

        return $entries
            ->sortBy([
                ['date', 'asc'],
                ['reference', 'asc'],
            ])
            ->values()
            ->map(function (array $entry) use (&$balance): array {
                $balance += $entry['debit'] - $entry['credit'];
                $entry['balance'] = number_format($balance, 2, '.', '');
                $entry['debit'] = number_format($entry['debit'], 2, '.', '');
                $entry['credit'] = number_format($entry['credit'], 2, '.', '');

                return $entry;
            });
    }
}
