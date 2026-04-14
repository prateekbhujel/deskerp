@extends('layouts.app')

@section('title', 'Payment Report')

@section('content')
    <section class="dp-section">
        <div class="dp-toolbar">
            <div>
                <h1 class="dp-title">Payment Report</h1>
                <p class="dp-subtitle">Payment activity with direction, method, and date filtering.</p>
            </div>
            <a href="{{ route('reports.payments', array_merge(request()->query(), ['export' => 'csv'])) }}" class="dp-btn-primary">Export CSV</a>
        </div>

        <form method="GET" class="dp-card p-4">
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
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
                        <option value="">All methods</option>
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
                    <a href="{{ route('reports.payments') }}" class="dp-btn">Reset</a>
                </div>
            </div>
        </form>

        <div class="dp-grid">
            <div class="dp-stat">
                <div class="text-sm text-slate-500">Received</div>
                <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format((float) $summary['received'], 2) }}</div>
            </div>
            <div class="dp-stat">
                <div class="text-sm text-slate-500">Made</div>
                <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format((float) $summary['made'], 2) }}</div>
            </div>
        </div>

        <div class="dp-table-wrap">
            <table class="dp-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Payment</th>
                        <th>Direction</th>
                        <th>Party</th>
                        <th>Method</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($payments as $payment)
                        <tr>
                            <td>{{ $payment->payment_date?->format('d M Y') }}</td>
                            <td><a href="{{ route('payments.show', $payment) }}" class="font-medium text-teal-700 hover:text-teal-800">{{ $payment->payment_number }}</a></td>
                            <td>{{ ucfirst($payment->direction) }}</td>
                            <td>{{ $payment->customer?->name ?? $payment->supplier?->name ?? 'N/A' }}</td>
                            <td>{{ ucfirst($payment->method) }}</td>
                            <td class="text-right">{{ number_format((float) $payment->amount, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center text-slate-500">No payments found for the current filters.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{ $payments->links() }}
    </section>
@endsection
