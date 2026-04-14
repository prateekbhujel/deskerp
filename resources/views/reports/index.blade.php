@extends('layouts.app')

@section('title', 'Report Center')

@section('content')
    <section class="dp-section">
        <div>
            <h1 class="dp-title">Report Center</h1>
            <p class="dp-subtitle">Open printable and export-friendly reports for sales, payments, inventory, and ledgers.</p>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
            <a href="{{ route('reports.sales') }}" class="dp-card p-5 transition hover:border-teal-300 hover:shadow-md">
                <h2 class="text-lg font-semibold text-slate-900">Sales Report</h2>
                <p class="mt-2 text-sm text-slate-500">Filter invoices by date and customer, then export CSV.</p>
            </a>
            <a href="{{ route('reports.payments') }}" class="dp-card p-5 transition hover:border-teal-300 hover:shadow-md">
                <h2 class="text-lg font-semibold text-slate-900">Payment Report</h2>
                <p class="mt-2 text-sm text-slate-500">Track money received and paid by date, method, and direction.</p>
            </a>
            <a href="{{ route('reports.inventory') }}" class="dp-card p-5 transition hover:border-teal-300 hover:shadow-md">
                <h2 class="text-lg font-semibold text-slate-900">Inventory Report</h2>
                <p class="mt-2 text-sm text-slate-500">Review stock on hand, reorder levels, and stock value estimates.</p>
            </a>
        </div>

        <div class="grid gap-6 xl:grid-cols-2">
            <div class="dp-card p-5">
                <h2 class="text-lg font-semibold text-slate-900">Customer Ledger</h2>
                <form method="GET" action="" class="mt-4 space-y-4">
                    <div>
                        <label class="dp-label" for="customer-ledger-selector">Customer</label>
                        <select class="dp-select" id="customer-ledger-selector" onchange="if (this.value) window.location.href=this.value">
                            <option value="">Select customer ledger</option>
                            @foreach ($customers as $customer)
                                <option value="{{ route('reports.customers.ledger', $customer) }}">{{ $customer->name }}</option>
                            @endforeach
                        </select>
                    </div>
                </form>
            </div>

            <div class="dp-card p-5">
                <h2 class="text-lg font-semibold text-slate-900">Supplier Ledger</h2>
                <form method="GET" action="" class="mt-4 space-y-4">
                    <div>
                        <label class="dp-label" for="supplier-ledger-selector">Supplier</label>
                        <select class="dp-select" id="supplier-ledger-selector" onchange="if (this.value) window.location.href=this.value">
                            <option value="">Select supplier ledger</option>
                            @foreach ($suppliers as $supplier)
                                <option value="{{ route('reports.suppliers.ledger', $supplier) }}">{{ $supplier->name }}</option>
                            @endforeach
                        </select>
                    </div>
                </form>
            </div>
        </div>
    </section>
@endsection
