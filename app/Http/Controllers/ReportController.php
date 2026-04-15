<?php

namespace App\Http\Controllers;

use App\Exports\CustomerLedgerExport;
use App\Exports\InventoryReportExport;
use App\Exports\PaymentsReportExport;
use App\Exports\SalesReportExport;
use App\Exports\SupplierLedgerExport;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Item;
use App\Models\Payment;
use App\Models\Supplier;
use App\Services\SettingsService;
use App\Support\CsvExport;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function __construct(
        private readonly SettingsService $settingsService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Reports/Index');
    }

    public function sales(Request $request)
    {
        [$dateFrom, $dateTo] = $this->resolvedDateFilters($request);

        $query = Invoice::query()
            ->with('customer')
            ->where('status', 'final')
            ->when($dateFrom, fn ($inner) => $inner->whereDate('issue_date', '>=', $dateFrom))
            ->when($dateTo, fn ($inner) => $inner->whereDate('issue_date', '<=', $dateTo))
            ->when($request->filled('customer_id'), fn ($inner) => $inner->where('customer_id', $request->integer('customer_id')))
            ->when($request->filled('q'), function ($inner) use ($request): void {
                $term = $request->string('q');
                $inner->where(function ($nested) use ($term): void {
                    $nested->where('invoice_number', 'like', "%{$term}%")
                        ->orWhere('customer_name', 'like', "%{$term}%");
                });
            })
            ->orderByDesc('issue_date');

        $rows = fn (Collection $invoices) => $invoices->map(fn (Invoice $invoice) => [
            $invoice->issue_date?->format('Y-m-d'),
            $invoice->invoice_number,
            $invoice->customer_name,
            $invoice->subtotal,
            $invoice->discount_total,
            $invoice->tax_total,
            $invoice->total,
            $invoice->paid_total,
            $invoice->balance_due,
        ]);

        if ($request->string('export')->toString() === 'csv') {
            return CsvExport::download(
                'deskerp-sales-report.csv',
                ['Date', 'Invoice', 'Customer', 'Subtotal', 'Discount', 'Tax', 'Total', 'Paid', 'Balance'],
                $rows($query->get()),
            );
        }

        if ($request->string('export')->toString() === 'xlsx') {
            return Excel::download(
                new SalesReportExport($rows($query->get())),
                'deskerp-sales-report.xlsx',
            );
        }

        $summaryQuery = clone $query;
        $invoices = $query->paginate(20)->withQueryString();

        return Inertia::render('Reports/Sales', [
            'invoices' => [
                'data' => $invoices->getCollection()->map(fn (Invoice $invoice) => [
                    'id' => $invoice->id,
                    'issue_date' => $invoice->issue_date?->format('Y-m-d'),
                    'invoice_number' => $invoice->invoice_number,
                    'customer_name' => $invoice->customer_name,
                    'subtotal' => $invoice->subtotal,
                    'discount_total' => $invoice->discount_total,
                    'tax_total' => $invoice->tax_total,
                    'total' => $invoice->total,
                    'paid_total' => $invoice->paid_total,
                    'balance_due' => $invoice->balance_due,
                ]),
                'meta' => $this->paginationMeta($invoices),
            ],
            'summary' => [
                'total_sales' => $summaryQuery->sum('total'),
                'total_tax' => (clone $summaryQuery)->sum('tax_total'),
                'total_balance' => (clone $summaryQuery)->sum('balance_due'),
            ],
            'filters' => [
                'q' => $request->string('q')->toString(),
                'customer_id' => $request->string('customer_id')->toString(),
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'selected_customer' => $request->filled('customer_id')
                ? optional(Customer::query()->find($request->integer('customer_id')), fn ($customer) => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'code' => $customer->code,
                    'phone' => $customer->phone,
                    'email' => $customer->email,
                    'taxNumber' => $customer->tax_number,
                    'billingAddress' => $customer->billing_address,
                ])
                : null,
        ]);
    }

    public function payments(Request $request)
    {
        [$dateFrom, $dateTo] = $this->resolvedDateFilters($request);

        $query = Payment::query()
            ->with(['customer', 'supplier', 'invoice'])
            ->when($dateFrom, fn ($inner) => $inner->whereDate('payment_date', '>=', $dateFrom))
            ->when($dateTo, fn ($inner) => $inner->whereDate('payment_date', '<=', $dateTo))
            ->when($request->filled('direction'), fn ($inner) => $inner->where('direction', $request->string('direction')))
            ->when($request->filled('method'), fn ($inner) => $inner->where('method', $request->string('method')))
            ->orderByDesc('payment_date');

        $rows = fn (Collection $payments) => $payments->map(fn (Payment $payment) => [
            $payment->payment_date?->format('Y-m-d'),
            $payment->payment_number,
            ucfirst($payment->direction),
            $payment->customer?->name ?? $payment->supplier?->name,
            $payment->invoice?->invoice_number,
            $payment->method,
            $payment->reference_number,
            $payment->amount,
        ]);

        if ($request->string('export')->toString() === 'csv') {
            return CsvExport::download(
                'deskerp-payment-report.csv',
                ['Date', 'Number', 'Direction', 'Party', 'Invoice', 'Method', 'Reference', 'Amount'],
                $rows($query->get()),
            );
        }

        if ($request->string('export')->toString() === 'xlsx') {
            return Excel::download(
                new PaymentsReportExport($rows($query->get())),
                'deskerp-payment-report.xlsx',
            );
        }

        $payments = $query->paginate(20)->withQueryString();

        return Inertia::render('Reports/Payments', [
            'payments' => [
                'data' => $payments->getCollection()->map(fn (Payment $payment) => [
                    'id' => $payment->id,
                    'payment_date' => $payment->payment_date?->format('Y-m-d'),
                    'payment_number' => $payment->payment_number,
                    'direction' => $payment->direction,
                    'party_name' => $payment->customer?->name ?? $payment->supplier?->name,
                    'invoice_number' => $payment->invoice?->invoice_number,
                    'method' => $payment->method,
                    'reference_number' => $payment->reference_number,
                    'amount' => $payment->amount,
                ]),
                'meta' => $this->paginationMeta($payments),
            ],
            'summary' => [
                'received' => (clone $query)->where('direction', 'received')->sum('amount'),
                'made' => (clone $query)->where('direction', 'made')->sum('amount'),
            ],
            'filters' => [
                'direction' => $request->string('direction')->toString(),
                'method' => $request->string('method')->toString(),
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function inventory(Request $request)
    {
        [$dateFrom, $dateTo] = $this->resolvedDateFilters($request);

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

        $rows = fn (Collection $items) => $items->map(fn (Item $item) => [
            $item->sku,
            $item->name,
            $item->category?->name,
            $item->unit?->code,
            $item->current_stock,
            $item->reorder_level,
            $item->base_price,
            number_format((float) $item->current_stock * (float) $item->base_price, 2, '.', ''),
        ]);

        if ($request->string('export')->toString() === 'csv') {
            return CsvExport::download(
                'deskerp-inventory-report.csv',
                ['SKU', 'Item', 'Category', 'Unit', 'Current Stock', 'Reorder Level', 'Base Price', 'Stock Value'],
                $rows($query->get()),
            );
        }

        if ($request->string('export')->toString() === 'xlsx') {
            return Excel::download(
                new InventoryReportExport($rows($query->get())),
                'deskerp-inventory-report.xlsx',
            );
        }

        $items = $query->paginate(20)->withQueryString();

        return Inertia::render('Reports/Inventory', [
            'items' => [
                'data' => $items->getCollection()->map(fn (Item $item) => [
                    'id' => $item->id,
                    'sku' => $item->sku,
                    'name' => $item->name,
                    'category_name' => $item->category?->name,
                    'unit_name' => $item->unit?->code,
                    'current_stock' => $item->current_stock,
                    'reorder_level' => $item->reorder_level,
                    'base_price' => $item->base_price,
                ]),
                'meta' => $this->paginationMeta($items),
            ],
            'summary' => [
                'tracked_items' => (clone $query)->where('track_inventory', true)->count(),
                'low_stock_items' => (clone $query)->whereColumn('current_stock', '<=', 'reorder_level')->where('reorder_level', '>', 0)->count(),
            ],
            'categories' => Category::query()->orderBy('name')->get(['id', 'name'])->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
            ]),
            'filters' => [
                'q' => $request->string('q')->toString(),
                'category_id' => $request->string('category_id')->toString(),
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function customerLedger(Request $request, Customer $customer)
    {
        [$dateFrom, $dateTo] = $this->resolvedDateFilters($request);

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
                ->when($dateFrom, fn ($query) => $query->whereDate('issue_date', '>=', $dateFrom))
                ->when($dateTo, fn ($query) => $query->whereDate('issue_date', '<=', $dateTo))
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
                ->when($dateFrom, fn ($query) => $query->whereDate('payment_date', '>=', $dateFrom))
                ->when($dateTo, fn ($query) => $query->whereDate('payment_date', '<=', $dateTo))
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

        if ($request->string('export')->toString() === 'csv') {
            return CsvExport::download(
                'deskerp-customer-ledger.csv',
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

        if ($request->string('export')->toString() === 'xlsx') {
            return Excel::download(
                new CustomerLedgerExport(
                    $ledger->map(fn (array $entry) => [
                        $entry['date'],
                        $entry['type'],
                        $entry['reference'],
                        $entry['debit'],
                        $entry['credit'],
                        $entry['balance'],
                        $entry['notes'],
                    ]),
                ),
                'deskerp-customer-ledger.xlsx',
            );
        }

        $paginated = $this->paginateCollection($ledger, $request);

        return Inertia::render('Reports/CustomerLedger', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
            ],
            'ledger' => [
                'data' => $paginated->items(),
                'meta' => $this->paginationMeta($paginated),
            ],
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function supplierLedger(Request $request, Supplier $supplier)
    {
        [$dateFrom, $dateTo] = $this->resolvedDateFilters($request);

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
                ->when($dateFrom, fn ($query) => $query->whereDate('payment_date', '>=', $dateFrom))
                ->when($dateTo, fn ($query) => $query->whereDate('payment_date', '<=', $dateTo))
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

        if ($request->string('export')->toString() === 'csv') {
            return CsvExport::download(
                'deskerp-supplier-ledger.csv',
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

        if ($request->string('export')->toString() === 'xlsx') {
            return Excel::download(
                new SupplierLedgerExport(
                    $ledger->map(fn (array $entry) => [
                        $entry['date'],
                        $entry['type'],
                        $entry['reference'],
                        $entry['debit'],
                        $entry['credit'],
                        $entry['balance'],
                        $entry['notes'],
                    ]),
                ),
                'deskerp-supplier-ledger.xlsx',
            );
        }

        $paginated = $this->paginateCollection($ledger, $request);

        return Inertia::render('Reports/SupplierLedger', [
            'supplier' => [
                'id' => $supplier->id,
                'name' => $supplier->name,
            ],
            'ledger' => [
                'data' => $paginated->items(),
                'meta' => $this->paginationMeta($paginated),
            ],
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
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

    private function resolvedDateFilters(Request $request): array
    {
        $defaults = $this->settingsService->defaultReportRange();

        return [
            $request->string('date_from')->toString() ?: $defaults['dateFrom'],
            $request->string('date_to')->toString() ?: $defaults['dateTo'],
        ];
    }

    private function paginationMeta($paginator): array
    {
        return [
            'currentPage' => $paginator->currentPage(),
            'lastPage' => $paginator->lastPage(),
            'perPage' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];
    }

    private function paginateCollection(Collection $collection, Request $request, int $perPage = 25): LengthAwarePaginator
    {
        $page = max(1, (int) $request->integer('page', 1));
        $items = $collection->forPage($page, $perPage)->values();

        return new LengthAwarePaginator(
            $items,
            $collection->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ],
        );
    }
}
