<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $suppliers = Supplier::query()
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

        return Inertia::render('Suppliers/Index', [
            'suppliers' => [
                'data' => $suppliers->getCollection()->map(fn (Supplier $supplier) => [
                    'id' => $supplier->id,
                    'code' => $supplier->code,
                    'name' => $supplier->name,
                    'phone' => $supplier->phone,
                    'email' => $supplier->email,
                    'opening_balance' => $supplier->opening_balance,
                    'is_active' => $supplier->is_active,
                ]),
                'meta' => $this->paginationMeta($suppliers),
            ],
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Suppliers/Form', [
            'mode' => 'create',
            'supplier' => [
                'id' => null,
                'code' => '',
                'name' => '',
                'contact_person' => '',
                'phone' => '',
                'email' => '',
                'tax_number' => '',
                'billing_address' => '',
                'opening_balance' => '0.00',
                'notes' => '',
                'is_active' => true,
            ],
        ]);
    }

    public function store(StoreSupplierRequest $request): RedirectResponse|JsonResponse
    {
        $supplier = Supplier::query()->create($this->validatedData($request));

        if ($request->expectsJson()) {
            return response()->json([
                'id' => $supplier->id,
                'name' => $supplier->name,
                'code' => $supplier->code,
                'phone' => $supplier->phone,
                'email' => $supplier->email,
                'taxNumber' => $supplier->tax_number,
                'billingAddress' => $supplier->billing_address,
            ]);
        }

        return redirect()
            ->route('suppliers.show', $supplier)
            ->with('success', 'Supplier created successfully.');
    }

    public function show(Supplier $supplier): Response
    {
        $supplier->load([
            'payments' => fn ($query) => $query->latest('payment_date')->limit(10),
        ]);

        return Inertia::render('Suppliers/Show', [
            'supplier' => [
                'id' => $supplier->id,
                'code' => $supplier->code,
                'name' => $supplier->name,
                'contact_person' => $supplier->contact_person,
                'phone' => $supplier->phone,
                'email' => $supplier->email,
                'tax_number' => $supplier->tax_number,
                'opening_balance' => $supplier->opening_balance,
                'billing_address' => $supplier->billing_address,
                'notes' => $supplier->notes,
                'is_active' => $supplier->is_active,
                'payments' => $supplier->payments->map(fn ($payment) => [
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

    public function edit(Supplier $supplier): Response
    {
        return Inertia::render('Suppliers/Form', [
            'mode' => 'edit',
            'supplier' => [
                'id' => $supplier->id,
                'code' => $supplier->code,
                'name' => $supplier->name,
                'contact_person' => $supplier->contact_person,
                'phone' => $supplier->phone,
                'email' => $supplier->email,
                'tax_number' => $supplier->tax_number,
                'billing_address' => $supplier->billing_address,
                'opening_balance' => (string) $supplier->opening_balance,
                'notes' => $supplier->notes,
                'is_active' => $supplier->is_active,
            ],
        ]);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier): RedirectResponse
    {
        $supplier->update($this->validatedData($request));

        return redirect()
            ->route('suppliers.show', $supplier)
            ->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        if ($supplier->payments()->exists()) {
            return back()->with('error', 'Supplier cannot be deleted once payments exist.');
        }

        $supplier->delete();

        return redirect()
            ->route('suppliers.index')
            ->with('success', 'Supplier deleted successfully.');
    }

    private function validatedData(StoreSupplierRequest|UpdateSupplierRequest $request): array
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
