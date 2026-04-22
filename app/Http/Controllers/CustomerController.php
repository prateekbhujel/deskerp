<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $customers = Customer::query()
            ->when($request->filled('q'), function ($query) use ($request): void {
                $term = $request->string('q');

                $query->where(function ($inner) use ($term): void {
                    $inner->where('name', 'like', "%{$term}%")
                        ->orWhere('code', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request): void {
                $query->where('is_active', $request->string('status') === 'active');
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => [
                'data' => $customers->getCollection()->map(fn (Customer $customer) => [
                    'id' => $customer->id,
                    'code' => $customer->code,
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                    'email' => $customer->email,
                    'opening_balance' => $customer->opening_balance,
                    'credit_limit' => $customer->credit_limit,
                    'is_active' => $customer->is_active,
                ]),
                'meta' => $this->paginationMeta($customers),
            ],
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Customers/Form', [
            'mode' => 'create',
            'customer' => [
                'id' => null,
                'code' => '',
                'name' => '',
                'contact_person' => '',
                'phone' => '',
                'email' => '',
                'tax_number' => '',
                'billing_address' => '',
                'shipping_address' => '',
                'opening_balance' => '0.00',
                'credit_limit' => '0.00',
                'notes' => '',
                'is_active' => true,
            ],
        ]);
    }

    public function store(StoreCustomerRequest $request): RedirectResponse|JsonResponse
    {
        $customer = Customer::query()->create($this->validatedData($request));

        if ($request->expectsJson()) {
            return response()->json([
                'id' => $customer->id,
                'name' => $customer->name,
                'code' => $customer->code,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'taxNumber' => $customer->tax_number,
                'billingAddress' => $customer->billing_address,
            ]);
        }

        return redirect()
            ->route('customers.show', $customer)
            ->with('success', 'Customer created successfully.');
    }

    public function show(Customer $customer): Response
    {
        $customer->load([
            'invoices' => fn ($query) => $query->latest('issue_date')->limit(10),
            'payments' => fn ($query) => $query->latest('payment_date')->limit(10),
        ]);

        return Inertia::render('Customers/Show', [
            'customer' => [
                'id' => $customer->id,
                'code' => $customer->code,
                'name' => $customer->name,
                'contact_person' => $customer->contact_person,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'tax_number' => $customer->tax_number,
                'opening_balance' => $customer->opening_balance,
                'credit_limit' => $customer->credit_limit,
                'billing_address' => $customer->billing_address,
                'shipping_address' => $customer->shipping_address,
                'notes' => $customer->notes,
                'is_active' => $customer->is_active,
                'invoices' => $customer->invoices->map(fn ($invoice) => [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'issue_date' => optional($invoice->issue_date)->format('Y-m-d'),
                    'total' => $invoice->total,
                    'balance_due' => $invoice->balance_due,
                    'status' => $invoice->status,
                    'payment_status' => $invoice->payment_status,
                ]),
                'payments' => $customer->payments->map(fn ($payment) => [
                    'id' => $payment->id,
                    'payment_number' => $payment->payment_number,
                    'payment_date' => optional($payment->payment_date)->format('Y-m-d'),
                    'method' => $payment->method,
                    'direction' => $payment->direction,
                    'amount' => $payment->amount,
                    'reference_number' => $payment->reference_number,
                ]),
            ],
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('Customers/Form', [
            'mode' => 'edit',
            'customer' => [
                'id' => $customer->id,
                'code' => $customer->code,
                'name' => $customer->name,
                'contact_person' => $customer->contact_person,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'tax_number' => $customer->tax_number,
                'billing_address' => $customer->billing_address,
                'shipping_address' => $customer->shipping_address,
                'opening_balance' => (string) $customer->opening_balance,
                'credit_limit' => (string) $customer->credit_limit,
                'notes' => $customer->notes,
                'is_active' => $customer->is_active,
            ],
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($this->validatedData($request));

        return redirect()
            ->route('customers.show', $customer)
            ->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        if ($customer->invoices()->exists() || $customer->payments()->exists()) {
            return back()->with('error', 'Customer cannot be deleted once invoices or payments exist.');
        }

        $customer->delete();

        return redirect()
            ->route('customers.index')
            ->with('success', 'Customer deleted successfully.');
    }

    private function validatedData(StoreCustomerRequest|UpdateCustomerRequest $request): array
    {
        $validated = $request->validated();
        $validated['is_active'] = $request->boolean('is_active', true);

        return $validated;
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
}
