@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
    @php
        $shortcuts = [
            ['label' => 'New Sales Invoice', 'hint' => 'Create and finalize sales entries quickly.', 'route' => route('invoices.create'), 'hotkey' => 'Alt+N'],
            ['label' => 'Record Receipt', 'hint' => 'Apply incoming customer payments.', 'route' => route('payments.create', ['direction' => 'received']), 'hotkey' => 'Alt+R'],
            ['label' => 'Open Item Master', 'hint' => 'Maintain stock, price, and tax setup.', 'route' => route('items.index'), 'hotkey' => 'Alt+I'],
            ['label' => 'Review Reports', 'hint' => 'Open sales, payment, and inventory registers.', 'route' => route('reports.index'), 'hotkey' => 'Alt+G'],
        ];
    @endphp

    <section class="dp-section">
        <div class="grid gap-4 xl:grid-cols-[1.65fr_0.9fr]">
            <div class="dp-card">
                <div class="dp-panel-head">
                    <div>
                        <h1 class="dp-title">Dashboard</h1>
                        <p class="dp-subtitle">Use the quick entry lane to move through daily sales, receipts, stock, and reporting without leaving the keyboard.</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <span class="dp-chip">Date {{ now()->format('d M Y') }}</span>
                        <span class="dp-chip">DeskERP</span>
                        <span class="dp-chip">Local Data</span>
                    </div>
                </div>

                <div class="grid gap-3 p-4 md:grid-cols-2">
                    @foreach ($shortcuts as $shortcut)
                        <a href="{{ $shortcut['route'] }}" class="dp-quick-link" data-hotkey="alt+{{ strtolower(substr($shortcut['hotkey'], -1)) }}">
                            <div>
                                <div class="text-sm font-semibold text-slate-900">{{ $shortcut['label'] }}</div>
                                <div class="mt-1 text-xs leading-5 text-slate-500">{{ $shortcut['hint'] }}</div>
                            </div>
                            <span class="dp-kbd">{{ $shortcut['hotkey'] }}</span>
                        </a>
                    @endforeach
                </div>
            </div>

            <div class="dp-card p-4">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <h2 class="text-base font-semibold text-slate-900">Focus Queue</h2>
                        <p class="mt-1 text-sm text-slate-500">Keep an eye on balances and stock pressure.</p>
                    </div>
                    <a href="{{ route('reports.inventory') }}" class="dp-btn">Inventory</a>
                </div>

                <div class="mt-4 space-y-3">
                    <div class="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Outstanding Sales</div>
                        <div class="mt-2 text-2xl font-semibold text-slate-900">{{ number_format((float) $stats['pending_receivables'], 2) }}</div>
                    </div>
                    <div class="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Low Stock Items</div>
                        <div class="mt-2 text-2xl font-semibold text-slate-900">{{ number_format($lowStockItems->count()) }}</div>
                    </div>
                    <div class="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Recent Invoices</div>
                        <div class="mt-2 text-2xl font-semibold text-slate-900">{{ number_format($recentInvoices->count()) }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div class="dp-stat">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Customers</div>
                <div class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format($stats['customers']) }}</div>
            </div>
            <div class="dp-stat">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Suppliers</div>
                <div class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format($stats['suppliers']) }}</div>
            </div>
            <div class="dp-stat">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Items</div>
                <div class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format($stats['items']) }}</div>
            </div>
            <div class="dp-stat">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Sales This Month</div>
                <div class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format((float) $stats['today_sales'], 2) }}</div>
            </div>
            <div class="dp-stat">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Balance Due</div>
                <div class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format((float) $stats['pending_receivables'], 2) }}</div>
            </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <div class="space-y-6">
                <div class="dp-card p-5">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <h2 class="text-lg font-semibold tracking-tight text-slate-900">Sales Register</h2>
                            <p class="mt-1 text-sm text-slate-500">Latest sales documents and running balance status.</p>
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
                            <h2 class="text-lg font-semibold tracking-tight text-slate-900">Payment Register</h2>
                            <p class="mt-1 text-sm text-slate-500">Incoming and outgoing payment entries recorded most recently.</p>
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
                        {{ number_format((float) $stats['pending_receivables'], 2) }}
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
                            <p class="mt-1 text-sm text-slate-500">Tracked items currently at or below their reorder level.</p>
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

                <div class="dp-card p-5">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <h2 class="text-lg font-semibold tracking-tight text-slate-900">Keyboard Shortcuts</h2>
                            <p class="mt-1 text-sm text-slate-500">Common navigation shortcuts available from anywhere in the workspace.</p>
                        </div>
                    </div>

                    <div class="mt-5 space-y-3">
                        @foreach ($shortcuts as $shortcut)
                            <div class="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                                <div>
                                    <div class="font-medium text-slate-900">{{ $shortcut['label'] }}</div>
                                    <div class="text-sm text-slate-500">{{ $shortcut['hint'] }}</div>
                                </div>
                                <span class="dp-kbd">{{ $shortcut['hotkey'] }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
