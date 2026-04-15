<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Supplier;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService,
    ) {}

    public function index(Request $request): Response
    {
        $payments = Payment::query()
            ->with(['customer', 'supplier', 'invoice'])
            ->when($request->filled('q'), function ($query) use ($request): void {
                $term = $request->string('q');

                $query->where(function ($inner) use ($term): void {
                    $inner->where('payment_number', 'like', "%{$term}%")
                        ->orWhere('reference_number', 'like', "%{$term}%");
                });
            })
            ->when($request->filled('direction'), fn ($query) => $query->where('direction', $request->string('direction')))
            ->when($request->filled('method'), fn ($query) => $query->where('method', $request->string('method')))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('payment_date', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('payment_date', '<=', $request->date('date_to')))
            ->latest('payment_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Payments/Index', [
            'payments' => [
                'data' => $payments->getCollection()->map(fn (Payment $payment) => [
                    'id' => $payment->id,
                    'payment_number' => $payment->payment_number,
                    'direction' => $payment->direction,
                    'party_name' => $payment->customer?->name ?? $payment->supplier?->name,
                    'invoice_number' => $payment->invoice?->invoice_number,
                    'payment_date' => optional($payment->payment_date)->format('Y-m-d'),
                    'method' => $payment->method,
                    'amount' => $payment->amount,
                ]),
                'meta' => $this->paginationMeta($payments),
            ],
            'filters' => [
                'q' => $request->string('q')->toString(),
                'direction' => $request->string('direction')->toString(),
                'method' => $request->string('method')->toString(),
                'date_from' => $request->string('date_from')->toString(),
                'date_to' => $request->string('date_to')->toString(),
            ],
            'methods' => $this->methods(),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Payments/Form', [
            'mode' => 'create',
            'payment' => [
                'id' => null,
                'direction' => $request->string('direction', 'received')->toString(),
                'customer_id' => null,
                'supplier_id' => null,
                'invoice_id' => null,
                'payment_date' => now()->toDateString(),
                'method' => 'cash',
                'reference_number' => '',
                'amount' => '0.00',
                'notes' => '',
            ],
            'selected_customer' => null,
            'selected_supplier' => null,
            'selected_invoice' => null,
            'methods' => $this->methods(),
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $payment = $this->paymentService->store($request->validated());

        return redirect()
            ->route('payments.show', $payment)
            ->with('success', 'Payment recorded successfully.');
    }

    public function show(Payment $payment): Response
    {
        $payment->load(['customer', 'supplier', 'invoice']);

        return Inertia::render('Payments/Show', [
            'payment' => [
                'id' => $payment->id,
                'payment_number' => $payment->payment_number,
                'direction' => $payment->direction,
                'payment_date' => optional($payment->payment_date)->format('Y-m-d'),
                'method' => $payment->method,
                'reference_number' => $payment->reference_number,
                'amount' => $payment->amount,
                'notes' => $payment->notes,
                'customer_name' => $payment->customer?->name,
                'supplier_name' => $payment->supplier?->name,
                'invoice_number' => $payment->invoice?->invoice_number,
                'invoice_id' => $payment->invoice?->id,
            ],
        ]);
    }

    public function edit(Payment $payment): Response
    {
        $payment->load('invoice');

        return Inertia::render('Payments/Form', [
            'mode' => 'edit',
            'payment' => [
                'id' => $payment->id,
                'direction' => $payment->direction,
                'customer_id' => $payment->customer_id,
                'supplier_id' => $payment->supplier_id,
                'invoice_id' => $payment->invoice_id,
                'payment_date' => optional($payment->payment_date)->format('Y-m-d'),
                'method' => $payment->method,
                'reference_number' => $payment->reference_number,
                'amount' => (string) $payment->amount,
                'notes' => $payment->notes,
            ],
            'selected_customer' => $payment->customer ? $this->customerLookup($payment->customer) : null,
            'selected_supplier' => $payment->supplier ? $this->supplierLookup($payment->supplier) : null,
            'selected_invoice' => $payment->invoice ? $this->invoiceLookup($payment->invoice) : null,
            'methods' => $this->methods(),
        ]);
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): RedirectResponse
    {
        $payment = $this->paymentService->update($payment, $request->validated());

        return redirect()
            ->route('payments.show', $payment)
            ->with('success', 'Payment updated successfully.');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        $this->paymentService->delete($payment);

        return redirect()
            ->route('payments.index')
            ->with('success', 'Payment deleted successfully.');
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

    private function methods(): array
    {
        return ['cash', 'bank', 'card', 'cheque', 'online'];
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

    private function supplierLookup(Supplier $supplier): array
    {
        return [
            'id' => $supplier->id,
            'name' => $supplier->name,
            'code' => $supplier->code,
            'phone' => $supplier->phone,
            'email' => $supplier->email,
            'taxNumber' => $supplier->tax_number,
            'billingAddress' => $supplier->billing_address,
        ];
    }

    private function invoiceLookup(Invoice $invoice): array
    {
        return [
            'id' => $invoice->id,
            'invoiceNumber' => $invoice->invoice_number,
            'customerId' => $invoice->customer_id,
            'customerName' => $invoice->customer_name,
            'issueDate' => optional($invoice->issue_date)->format('Y-m-d'),
            'balanceDue' => $invoice->balance_due,
        ];
    }
}
