<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Item;
use App\Models\Unit;
use App\Services\InvoiceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly InvoiceService $invoiceService,
    ) {}

    public function index(Request $request): Response
    {
        $invoices = Invoice::query()
            ->with('customer')
            ->when($request->filled('q'), function ($query) use ($request): void {
                $term = $request->string('q');

                $query->where(function ($inner) use ($term): void {
                    $inner->where('invoice_number', 'like', "%{$term}%")
                        ->orWhere('customer_name', 'like', "%{$term}%")
                        ->orWhere('reference_number', 'like', "%{$term}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('payment_status'), fn ($query) => $query->where('payment_status', $request->string('payment_status')))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('issue_date', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('issue_date', '<=', $request->date('date_to')))
            ->latest('issue_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Invoices/Index', [
            'invoices' => [
                'data' => $invoices->getCollection()->map(fn (Invoice $invoice) => [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'customer_name' => $invoice->customer_name,
                    'issue_date' => optional($invoice->issue_date)->format('Y-m-d'),
                    'status' => $invoice->status,
                    'payment_status' => $invoice->payment_status,
                    'total' => $invoice->total,
                    'balance_due' => $invoice->balance_due,
                ]),
                'meta' => $this->paginationMeta($invoices),
            ],
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
                'payment_status' => $request->string('payment_status')->toString(),
                'date_from' => $request->string('date_from')->toString(),
                'date_to' => $request->string('date_to')->toString(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Invoices/Form', [
            'mode' => 'create',
            'invoice' => [
                'id' => null,
                'invoice_number' => null,
                'customer_id' => null,
                'issue_date' => now()->toDateString(),
                'due_date' => null,
                'status' => 'draft',
                'reference_number' => '',
                'notes' => '',
                'lines' => [
                    $this->blankInvoiceLine(),
                    $this->blankInvoiceLine(),
                    $this->blankInvoiceLine(),
                    $this->blankInvoiceLine(),
                ],
            ],
            'selected_customer' => null,
            'selected_line_items' => [],
            'support' => $this->formSupport(),
        ]);
    }

    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $invoice = $this->invoiceService->store($request->validated(), $request->user());

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Invoice saved successfully.');
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load(['customer', 'createdBy', 'lines.item.unit', 'payments.customer']);

        return Inertia::render('Invoices/Show', [
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'status' => $invoice->status,
                'payment_status' => $invoice->payment_status,
                'issue_date' => optional($invoice->issue_date)->format('Y-m-d'),
                'due_date' => optional($invoice->due_date)->format('Y-m-d'),
                'reference_number' => $invoice->reference_number,
                'notes' => $invoice->notes,
                'customer_name' => $invoice->customer_name,
                'billing_address' => $invoice->billing_address,
                'tax_number' => $invoice->tax_number,
                'subtotal' => $invoice->subtotal,
                'discount_total' => $invoice->discount_total,
                'tax_total' => $invoice->tax_total,
                'total' => $invoice->total,
                'paid_total' => $invoice->paid_total,
                'balance_due' => $invoice->balance_due,
                'finalized_at' => optional($invoice->finalized_at)->format('Y-m-d H:i:s'),
                'created_by' => $invoice->createdBy?->name,
                'lines' => $invoice->lines->map(fn ($line) => [
                    'id' => $line->id,
                    'description' => $line->description,
                    'unit_name' => $line->unit_name,
                    'quantity' => $line->quantity,
                    'rate' => $line->rate,
                    'discount_percent' => $line->discount_percent,
                    'tax_percent' => $line->tax_percent,
                    'total' => $line->total,
                ]),
                'payments' => $invoice->payments->map(fn ($payment) => [
                    'id' => $payment->id,
                    'payment_number' => $payment->payment_number,
                    'payment_date' => optional($payment->payment_date)->format('Y-m-d'),
                    'method' => $payment->method,
                    'amount' => $payment->amount,
                ]),
            ],
        ]);
    }

    public function edit(Invoice $invoice): Response
    {
        $invoice->load('lines.item.unit');

        return Inertia::render('Invoices/Form', [
            'mode' => 'edit',
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'customer_id' => $invoice->customer_id,
                'issue_date' => optional($invoice->issue_date)->format('Y-m-d'),
                'due_date' => optional($invoice->due_date)->format('Y-m-d'),
                'status' => $invoice->status,
                'reference_number' => $invoice->reference_number,
                'notes' => $invoice->notes,
                'lines' => $invoice->lines->map(fn ($line) => [
                    'item_id' => $line->item_id,
                    'description' => $line->description,
                    'unit_name' => $line->unit_name,
                    'quantity' => (string) $line->quantity,
                    'rate' => (string) $line->rate,
                    'discount_percent' => (string) $line->discount_percent,
                    'tax_percent' => (string) $line->tax_percent,
                ])->values()->all(),
            ],
            'selected_customer' => $invoice->customer ? $this->customerLookup($invoice->customer) : null,
            'selected_line_items' => $invoice->lines
                ->map(fn ($line, $index) => $line->item ? [
                    'line_index' => $index,
                    'item' => $this->itemLookup($line->item),
                ] : null)
                ->filter()
                ->values()
                ->all(),
            'support' => $this->formSupport(),
        ]);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice): RedirectResponse
    {
        $invoice = $this->invoiceService->update($invoice, $request->validated(), $request->user());

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Invoice updated successfully.');
    }

    public function destroy(Invoice $invoice): RedirectResponse
    {
        if ($invoice->status !== 'draft') {
            return back()->with('error', 'Only draft invoices can be deleted.');
        }

        if ($invoice->payments()->exists()) {
            return back()->with('error', 'Invoices with linked payments cannot be deleted.');
        }

        $invoice->delete();

        return redirect()
            ->route('invoices.index')
            ->with('success', 'Invoice deleted successfully.');
    }

    public function print(Invoice $invoice): View
    {
        $invoice->load(['customer', 'lines.item.unit', 'payments']);

        return view('invoices.print', compact('invoice'));
    }

    public function pdf(Invoice $invoice)
    {
        $invoice->load(['customer', 'lines.item.unit', 'payments']);

        return Pdf::loadView('invoices.print', compact('invoice'))
            ->setPaper('a4')
            ->download($this->pdfFilename($invoice));
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

    private function blankInvoiceLine(): array
    {
        return [
            'item_id' => null,
            'description' => '',
            'unit_name' => '',
            'quantity' => '1',
            'rate' => '0.00',
            'discount_percent' => '0',
            'tax_percent' => '0',
        ];
    }

    private function pdfFilename(Invoice $invoice): string
    {
        return Str::of($invoice->invoice_number ?: 'invoice')
            ->replaceMatches('/[\/\\\\]+/', '-')
            ->append('.pdf')
            ->toString();
    }

    private function customerLookup(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'code' => $customer->code,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'taxNumber' => $customer->tax_number,
            'billingAddress' => $customer->billing_address,
        ];
    }

    private function itemLookup(Item $item): array
    {
        $item->loadMissing('unit');

        return [
            'id' => $item->id,
            'name' => $item->name,
            'sku' => $item->sku,
            'unit' => $item->unit?->code,
            'sellingPrice' => $item->selling_price,
            'taxRate' => $item->tax_rate,
            'trackInventory' => $item->track_inventory,
            'currentStock' => $item->current_stock,
        ];
    }

    private function formSupport(): array
    {
        return [
            'units' => Unit::query()->orderBy('name')->get(['id', 'name'])->map(fn ($unit) => [
                'id' => $unit->id,
                'name' => $unit->name,
            ]),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name'])->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
            ]),
        ];
    }
}
