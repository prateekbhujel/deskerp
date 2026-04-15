<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Item;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\AbstractPaginator;

class LookupController extends Controller
{
    public function customers(Request $request): JsonResponse
    {
        $results = Customer::query()
            ->where('is_active', true)
            ->when($request->filled('q'), function ($query) use ($request): void {
                $term = $request->string('q');

                $query->where(function ($inner) use ($term): void {
                    $inner->where('name', 'like', "%{$term}%")
                        ->orWhere('code', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%");
                });
            })
            ->orderBy('name')
            ->simplePaginate($this->perPage($request));

        return response()->json([
            'data' => $results->getCollection()->map(fn (Customer $customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
                'code' => $customer->code,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'taxNumber' => $customer->tax_number,
                'billingAddress' => $customer->billing_address,
            ]),
            'meta' => $this->paginationMeta($results),
        ]);
    }

    public function suppliers(Request $request): JsonResponse
    {
        $results = Supplier::query()
            ->where('is_active', true)
            ->when($request->filled('q'), function ($query) use ($request): void {
                $term = $request->string('q');

                $query->where(function ($inner) use ($term): void {
                    $inner->where('name', 'like', "%{$term}%")
                        ->orWhere('code', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%");
                });
            })
            ->orderBy('name')
            ->simplePaginate($this->perPage($request));

        return response()->json([
            'data' => $results->getCollection()->map(fn (Supplier $supplier) => [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'code' => $supplier->code,
                'phone' => $supplier->phone,
                'email' => $supplier->email,
                'taxNumber' => $supplier->tax_number,
                'billingAddress' => $supplier->billing_address,
            ]),
            'meta' => $this->paginationMeta($results),
        ]);
    }

    public function items(Request $request): JsonResponse
    {
        $results = Item::query()
            ->with('unit')
            ->where('is_active', true)
            ->when($request->filled('q'), function ($query) use ($request): void {
                $term = $request->string('q');

                $query->where(function ($inner) use ($term): void {
                    $inner->where('name', 'like', "%{$term}%")
                        ->orWhere('sku', 'like', "%{$term}%");
                });
            })
            ->orderBy('name')
            ->simplePaginate($this->perPage($request));

        return response()->json([
            'data' => $results->getCollection()->map(fn (Item $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'sku' => $item->sku,
                'unit' => $item->unit?->code,
                'sellingPrice' => $item->selling_price,
                'taxRate' => $item->tax_rate,
                'trackInventory' => $item->track_inventory,
                'currentStock' => $item->current_stock,
            ]),
            'meta' => $this->paginationMeta($results),
        ]);
    }

    public function openInvoices(Request $request): JsonResponse
    {
        $results = Invoice::query()
            ->where('status', 'final')
            ->where('balance_due', '>', 0)
            ->when($request->filled('q'), function ($query) use ($request): void {
                $term = $request->string('q');

                $query->where(function ($inner) use ($term): void {
                    $inner->where('invoice_number', 'like', "%{$term}%")
                        ->orWhere('customer_name', 'like', "%{$term}%");
                });
            })
            ->latest('issue_date')
            ->simplePaginate($this->perPage($request));

        return response()->json([
            'data' => $results->getCollection()->map(fn (Invoice $invoice) => [
                'id' => $invoice->id,
                'invoiceNumber' => $invoice->invoice_number,
                'customerId' => $invoice->customer_id,
                'customerName' => $invoice->customer_name,
                'issueDate' => optional($invoice->issue_date)->format('Y-m-d'),
                'balanceDue' => $invoice->balance_due,
            ]),
            'meta' => $this->paginationMeta($results),
        ]);
    }

    private function paginationMeta(AbstractPaginator $paginator): array
    {
        return [
            'currentPage' => $paginator->currentPage(),
            'perPage' => $paginator->perPage(),
            'hasMorePages' => $paginator->hasMorePages(),
            'nextPage' => $paginator->hasMorePages() ? $paginator->currentPage() + 1 : null,
        ];
    }

    private function perPage(Request $request): int
    {
        return min(max((int) $request->integer('per_page', 15), 5), 50);
    }
}
