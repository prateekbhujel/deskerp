@extends('layouts.app')

@section('title', $payment->payment_number)

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">{{ $payment->payment_number }}</h1>
                <p class="dp-subtitle">{{ ucfirst($payment->direction) }} / {{ $payment->payment_date?->format('d M Y') }}</p>
            </div>
            <div class="flex flex-wrap gap-3">
                <a href="{{ route('payments.edit', $payment) }}" class="dp-btn">Edit</a>
                <a href="{{ route('payments.index') }}" class="dp-btn-primary">Back to Payments</a>
            </div>
        </div>

        <div class="dp-card p-5">
            <dl class="grid gap-5 text-sm md:grid-cols-3">
                <div>
                    <dt class="text-slate-500">Direction</dt>
                    <dd class="mt-1 font-medium text-slate-900">{{ ucfirst($payment->direction) }}</dd>
                </div>
                <div>
                    <dt class="text-slate-500">Party</dt>
                    <dd class="mt-1 font-medium text-slate-900">{{ $payment->customer?->name ?? $payment->supplier?->name ?? 'N/A' }}</dd>
                </div>
                <div>
                    <dt class="text-slate-500">Amount</dt>
                    <dd class="mt-1 font-medium text-slate-900">{{ number_format((float) $payment->amount, 2) }}</dd>
                </div>
                <div>
                    <dt class="text-slate-500">Method</dt>
                    <dd class="mt-1 font-medium text-slate-900">{{ ucfirst($payment->method) }}</dd>
                </div>
                <div>
                    <dt class="text-slate-500">Reference</dt>
                    <dd class="mt-1 font-medium text-slate-900">{{ $payment->reference_number ?: 'N/A' }}</dd>
                </div>
                <div>
                    <dt class="text-slate-500">Invoice</dt>
                    <dd class="mt-1 font-medium text-slate-900">
                        @if ($payment->invoice)
                            <a href="{{ route('invoices.show', $payment->invoice) }}" class="text-teal-700 hover:text-teal-800">{{ $payment->invoice->invoice_number }}</a>
                        @else
                            N/A
                        @endif
                    </dd>
                </div>
                <div class="md:col-span-3">
                    <dt class="text-slate-500">Notes</dt>
                    <dd class="mt-1 whitespace-pre-line text-slate-900">{{ $payment->notes ?: 'N/A' }}</dd>
                </div>
            </dl>
        </div>
    </section>
@endsection
