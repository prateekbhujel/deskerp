@extends('layouts.app')

@section('title', 'Invoices')

@section('content')
    <section class="dp-section">
        <div class="dp-toolbar">
            <div>
                <h1 class="dp-title">Invoices</h1>
                <p class="dp-subtitle">Create, finalize, print, and monitor sales invoices.</p>
            </div>
            <a href="{{ route('invoices.create') }}" class="dp-btn-primary">New Invoice</a>
        </div>

        <form method="GET" class="dp-card p-4">
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
                <div>
                    <label class="dp-label" for="q">Search</label>
                    <input class="dp-input" id="q" name="q" value="{{ request('q') }}" placeholder="Invoice, customer, reference">
                </div>
                <div>
                    <label class="dp-label" for="status">Status</label>
                    <select class="dp-select" id="status" name="status">
                        <option value="">All</option>
                        <option value="draft" @selected(request('status') === 'draft')>Draft</option>
                        <option value="final" @selected(request('status') === 'final')>Final</option>
                    </select>
                </div>
                <div>
                    <label class="dp-label" for="payment_status">Payment Status</label>
                    <select class="dp-select" id="payment_status" name="payment_status">
                        <option value="">All</option>
                        <option value="unpaid" @selected(request('payment_status') === 'unpaid')>Unpaid</option>
                        <option value="partial" @selected(request('payment_status') === 'partial')>Partial</option>
                        <option value="paid" @selected(request('payment_status') === 'paid')>Paid</option>
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
                    <a href="{{ route('invoices.index') }}" class="dp-btn">Reset</a>
                </div>
            </div>
        </form>

        <div class="dp-table-wrap">
            <table class="dp-table">
                <thead>
                    <tr>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th class="text-right">Total</th>
                        <th class="text-right">Balance</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($invoices as $invoice)
                        <tr>
                            <td>
                                <div class="font-medium text-slate-900">{{ $invoice->invoice_number }}</div>
                                <div class="text-xs text-slate-500">{{ $invoice->reference_number ?: 'No reference' }}</div>
                            </td>
                            <td>{{ $invoice->customer_name }}</td>
                            <td>{{ $invoice->issue_date?->format('d M Y') }}</td>
                            <td>
                                <span class="dp-badge {{ $invoice->payment_status === 'paid' ? 'dp-badge-success' : ($invoice->status === 'draft' ? 'dp-badge-neutral' : 'dp-badge-warning') }}">
                                    {{ ucfirst($invoice->status) }} / {{ ucfirst($invoice->payment_status) }}
                                </span>
                            </td>
                            <td class="text-right">{{ number_format((float) $invoice->total, 2) }}</td>
                            <td class="text-right">{{ number_format((float) $invoice->balance_due, 2) }}</td>
                            <td class="text-right">
                                <a href="{{ route('invoices.show', $invoice) }}" class="font-medium text-teal-700 hover:text-teal-800">Open</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-slate-500">No invoices found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{ $invoices->links() }}
    </section>
@endsection
