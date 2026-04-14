<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Supplier;
use App\Services\PaymentService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService,
    ) {}

    public function index(Request $request): View
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

        return view('payments.index', compact('payments'));
    }

    public function create(Request $request): View
    {
        return view('payments.create', [
            'payment' => new Payment([
                'payment_date' => now()->toDateString(),
                'direction' => $request->string('direction', 'received')->toString(),
            ]),
            'customers' => Customer::query()->where('is_active', true)->orderBy('name')->get(),
            'suppliers' => Supplier::query()->where('is_active', true)->orderBy('name')->get(),
            'openInvoices' => Invoice::query()
                ->where('status', 'final')
                ->where('balance_due', '>', 0)
                ->orderBy('issue_date')
                ->get(),
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $payment = $this->paymentService->store($request->validated());

        return redirect()
            ->route('payments.show', $payment)
            ->with('success', 'Payment recorded successfully.');
    }

    public function show(Payment $payment): View
    {
        $payment->load(['customer', 'supplier', 'invoice']);

        return view('payments.show', compact('payment'));
    }

    public function edit(Payment $payment): View
    {
        $payment->load('invoice');

        $openInvoiceIds = Invoice::query()
            ->where('status', 'final')
            ->where('balance_due', '>', 0)
            ->pluck('id')
            ->push($payment->invoice_id)
            ->filter()
            ->unique()
            ->all();

        return view('payments.edit', [
            'payment' => $payment,
            'customers' => Customer::query()->where('is_active', true)->orderBy('name')->get(),
            'suppliers' => Supplier::query()->where('is_active', true)->orderBy('name')->get(),
            'openInvoices' => Invoice::query()
                ->whereIn('id', $openInvoiceIds)
                ->orderBy('issue_date')
                ->get(),
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
}
