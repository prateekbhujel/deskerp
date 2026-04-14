@extends('layouts.app')

@section('title', 'Sales Report')

@section('content')
    <section class="dp-section">
        <div class="dp-toolbar">
            <div>
                <h1 class="dp-title">Sales Report</h1>
                <p class="dp-subtitle">Finalized sales invoices with date filters and CSV export.</p>
            </div>
            <a href="{{ route('reports.sales', array_merge(request()->query(), ['export' => 'csv'])) }}" class="dp-btn-primary">Export CSV</a>
        </div>

        <form method="GET" class="dp-card p-4">
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <div>
                    <label class="dp-label" for="q">Search</label>
                    <input class="dp-input" id="q" name="q" value="{{ request('q') }}" placeholder="Invoice or customer">
                </div>
                <div>
                    <label class="dp-label" for="customer_id">Customer</label>
                    <select class="dp-select" id="customer_id" name="customer_id">
                        <option value="">All customers</option>
                        @foreach ($customers as $customer)
                            <option value="{{ $customer->id }}" @selected((string) request('customer_id') === (string) $customer->id)>{{ $customer->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="dp-label" for="date_from">From</label>
                    <input class="dp-input" id="date_from" type="date" name="date_from" value="{{ request('date_from') }}">
                </div>
                <div>
                    <label class="dp-label" for="date_to">To</label>
                    <input class="dp-input" id="date_to" type="date" name="date_to" value="{{ request('date_to') }}">
                </div>
                <div class="flex items-end gap-3">
                    <button type="submit" class="dp-btn-primary">Filter</button>
                    <a href="{{ route('reports.sales') }}" class="dp-btn">Reset</a>
                </div>
            </div>
        </form>

        <div class="dp-grid">
            <div class="dp-stat">
                <div class="text-sm text-slate-500">Total Sales</div>
                <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format((float) $summary['total_sales'], 2) }}</div>
            </div>
            <div class="dp-stat">
                <div class="text-sm text-slate-500">Tax</div>
                <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format((float) $summary['total_tax'], 2) }}</div>
            </div>
            <div class="dp-stat">
                <div class="text-sm text-slate-500">Outstanding</div>
                <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format((float) $summary['total_balance'], 2) }}</div>
            </div>
        </div>

        <div class="dp-table-wrap">
            <table class="dp-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th class="text-right">Total</th>
                        <th class="text-right">Paid</th>
                        <th class="text-right">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($invoices as $invoice)
                        <tr>
                            <td>{{ $invoice->issue_date?->format('d M Y') }}</td>
                            <td><a href="{{ route('invoices.show', $invoice) }}" class="font-medium text-teal-700 hover:text-teal-800">{{ $invoice->invoice_number }}</a></td>
                            <td>{{ $invoice->customer_name }}</td>
                            <td class="text-right">{{ number_format((float) $invoice->total, 2) }}</td>
                            <td class="text-right">{{ number_format((float) $invoice->paid_total, 2) }}</td>
                            <td class="text-right">{{ number_format((float) $invoice->balance_due, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center text-slate-500">No sales found for the current filters.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{ $invoices->links() }}
    </section>
@endsection
