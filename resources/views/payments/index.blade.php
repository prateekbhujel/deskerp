@extends('layouts.app')

@section('title', 'Payments')

@section('content')
    <section class="dp-section">
        <div class="dp-toolbar">
            <div>
                <h1 class="dp-title">Payments</h1>
                <p class="dp-subtitle">Track money received from customers and paid to suppliers.</p>
            </div>
            <div class="flex flex-wrap gap-3">
                <a href="{{ route('payments.create', ['direction' => 'received']) }}" class="dp-btn-primary">Payment Received</a>
                <a href="{{ route('payments.create', ['direction' => 'made']) }}" class="dp-btn">Payment Made</a>
            </div>
        </div>

        <form method="GET" class="dp-card p-4">
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
                <div>
                    <label class="dp-label" for="q">Search</label>
                    <input class="dp-input" id="q" name="q" value="{{ request('q') }}" placeholder="Payment number or reference">
                </div>
                <div>
                    <label class="dp-label" for="direction">Direction</label>
                    <select class="dp-select" id="direction" name="direction">
                        <option value="">All</option>
                        <option value="received" @selected(request('direction') === 'received')>Received</option>
                        <option value="made" @selected(request('direction') === 'made')>Made</option>
                    </select>
                </div>
                <div>
                    <label class="dp-label" for="method">Method</label>
                    <select class="dp-select" id="method" name="method">
                        <option value="">All</option>
                        @foreach (['cash', 'bank', 'card', 'cheque', 'upi', 'other'] as $method)
                            <option value="{{ $method }}" @selected(request('method') === $method)>{{ ucfirst($method) }}</option>
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
                    <a href="{{ route('payments.index') }}" class="dp-btn">Reset</a>
                </div>
            </div>
        </form>

        <div class="dp-table-wrap">
            <table class="dp-table">
                <thead>
                    <tr>
                        <th>Payment</th>
                        <th>Party</th>
                        <th>Invoice</th>
                        <th>Method</th>
                        <th>Date</th>
                        <th class="text-right">Amount</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($payments as $payment)
                        <tr>
                            <td>
                                <div class="font-medium text-slate-900">{{ $payment->payment_number }}</div>
                                <div class="text-xs text-slate-500">{{ ucfirst($payment->direction) }}</div>
                            </td>
                            <td>{{ $payment->customer?->name ?? $payment->supplier?->name ?? 'N/A' }}</td>
                            <td>{{ $payment->invoice?->invoice_number ?: 'N/A' }}</td>
                            <td>{{ ucfirst($payment->method) }}</td>
                            <td>{{ $payment->payment_date?->format('d M Y') }}</td>
                            <td class="text-right">{{ number_format((float) $payment->amount, 2) }}</td>
                            <td class="text-right">
                                <a href="{{ route('payments.show', $payment) }}" class="font-medium text-teal-700 hover:text-teal-800">Open</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-slate-500">No payments found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{ $payments->links() }}
    </section>
@endsection
