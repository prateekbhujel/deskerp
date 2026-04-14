<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Item;
use App\Services\InvoiceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly InvoiceService $invoiceService,
    ) {}

    public function index(Request $request): View
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

        return view('invoices.index', compact('invoices'));
    }

    public function create(): View
    {
        return view('invoices.create', [
            'invoice' => new Invoice([
                'issue_date' => now()->toDateString(),
                'status' => 'draft',
            ]),
            'customers' => Customer::query()->where('is_active', true)->orderBy('name')->get(),
            'items' => Item::query()->with('unit', 'prices')->where('is_active', true)->orderBy('name')->get(),
            'lineItems' => [null],
        ]);
    }

    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $invoice = $this->invoiceService->store($request->validated(), $request->user());

        return redirect()
            ->route('invoices.show', $invoice)
            ->with('success', 'Invoice saved successfully.');
    }

    public function show(Invoice $invoice): View
    {
        $invoice->load(['customer', 'createdBy', 'lines.item.unit', 'payments.customer']);

        return view('invoices.show', compact('invoice'));
    }

    public function edit(Invoice $invoice): View
    {
        $invoice->load('lines.item.unit');

        return view('invoices.edit', [
            'invoice' => $invoice,
            'customers' => Customer::query()->where('is_active', true)->orderBy('name')->get(),
            'items' => Item::query()->with('unit', 'prices')->where('is_active', true)->orderBy('name')->get(),
            'lineItems' => $invoice->lines,
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
            ->download($invoice->invoice_number.'.pdf');
    }
}
