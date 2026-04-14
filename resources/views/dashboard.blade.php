@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
    <section class="dp-section">
        <div class="dp-grid">
            <div class="dp-stat">
                <div class="text-sm text-slate-500">Customers</div>
                <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format($stats['customers']) }}</div>
            </div>
            <div class="dp-stat">
                <div class="text-sm text-slate-500">Suppliers</div>
                <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format($stats['suppliers']) }}</div>
            </div>
            <div class="dp-stat">
                <div class="text-sm text-slate-500">Items</div>
                <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format($stats['items']) }}</div>
            </div>
            <div class="dp-stat">
                <div class="text-sm text-slate-500">Sales This Month</div>
                <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format((float) $stats['sales_this_month'], 2) }}</div>
            </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <div class="space-y-6">
                <div class="dp-card p-5">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <h2 class="text-lg font-semibold tracking-tight text-slate-900">Recent invoices</h2>
                            <p class="mt-1 text-sm text-slate-500">Latest sales documents and balance status.</p>
                        </div>
                        <a href="{{ route('invoices.index') }}" class="dp-btn">View all</a>
                    </div>

                    <div class="mt-5 dp-table-wrap border-0 shadow-none">
                        <table class="dp-table">
                            <thead>
                                <tr>
                                    <th>Invoice</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th class="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($recentInvoices as $invoice)
                                    <tr>
                                        <td>
                                            <a href="{{ route('invoices.show', $invoice) }}" class="font-medium text-teal-700 hover:text-teal-800">
                                                {{ $invoice->invoice_number }}
                                            </a>
                                        </td>
                                        <td>{{ $invoice->customer_name }}</td>
                                        <td>{{ $invoice->issue_date?->format('d M Y') }}</td>
                                        <td>
                                            <span class="dp-badge {{ $invoice->payment_status === 'paid' ? 'dp-badge-success' : ($invoice->status === 'draft' ? 'dp-badge-neutral' : 'dp-badge-warning') }}">
                                                {{ ucfirst($invoice->status) }} / {{ ucfirst($invoice->payment_status) }}
                                            </span>
                                        </td>
                                        <td class="text-right">{{ number_format((float) $invoice->total, 2) }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="text-center text-slate-500">No invoices yet.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="dp-card p-5">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <h2 class="text-lg font-semibold tracking-tight text-slate-900">Recent payments</h2>
                            <p class="mt-1 text-sm text-slate-500">Incoming and outgoing payments recorded most recently.</p>
                        </div>
                        <a href="{{ route('payments.index') }}" class="dp-btn">View all</a>
                    </div>

                    <div class="mt-5 dp-table-wrap border-0 shadow-none">
                        <table class="dp-table">
                            <thead>
                                <tr>
                                    <th>Number</th>
                                    <th>Direction</th>
                                    <th>Party</th>
                                    <th>Date</th>
                                    <th class="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($recentPayments as $payment)
                                    <tr>
                                        <td>
                                            <a href="{{ route('payments.show', $payment) }}" class="font-medium text-teal-700 hover:text-teal-800">
                                                {{ $payment->payment_number }}
                                            </a>
                                        </td>
                                        <td>
                                            <span class="dp-badge {{ $payment->direction === 'received' ? 'dp-badge-success' : 'dp-badge-warning' }}">
                                                {{ ucfirst($payment->direction) }}
                                            </span>
                                        </td>
                                        <td>{{ $payment->customer?->name ?? $payment->supplier?->name ?? 'N/A' }}</td>
                                        <td>{{ $payment->payment_date?->format('d M Y') }}</td>
                                        <td class="text-right">{{ number_format((float) $payment->amount, 2) }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="text-center text-slate-500">No payments yet.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="space-y-6">
                <div class="dp-card p-5">
                    <h2 class="text-lg font-semibold tracking-tight text-slate-900">Outstanding sales balance</h2>
                    <div class="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                        {{ number_format((float) $stats['outstanding'], 2) }}
                    </div>
                    <p class="mt-2 text-sm text-slate-500">Sum of final invoice balances that are still unpaid or partially paid.</p>
                    <div class="mt-5 flex flex-wrap gap-3">
                        <a href="{{ route('invoices.create') }}" class="dp-btn-primary">New Invoice</a>
                        <a href="{{ route('payments.create', ['direction' => 'received']) }}" class="dp-btn">Record Receipt</a>
                    </div>
                </div>

                <div class="dp-card p-5">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <h2 class="text-lg font-semibold tracking-tight text-slate-900">Low stock watch</h2>
                            <p class="mt-1 text-sm text-slate-500">Tracked items currently at or below reorder level.</p>
                        </div>
                        <a href="{{ route('reports.inventory') }}" class="dp-btn">Inventory report</a>
                    </div>

                    <div class="mt-5 space-y-3">
                        @forelse ($lowStockItems as $item)
                            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div class="flex items-center justify-between gap-4">
                                    <div>
                                        <div class="font-medium text-slate-900">{{ $item->name }}</div>
                                        <div class="text-sm text-slate-500">{{ $item->sku ?: 'No SKU' }}</div>
                                    </div>
                                    <div class="text-right text-sm">
                                        <div class="font-semibold text-slate-900">{{ number_format((float) $item->current_stock, 3) }}</div>
                                        <div class="text-slate-500">Reorder {{ number_format((float) $item->reorder_level, 3) }}</div>
                                    </div>
                                </div>
                            </div>
                        @empty
                            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                No low stock items right now.
                            </div>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
