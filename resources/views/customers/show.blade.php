@extends('layouts.app')

@section('title', $customer->name)

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">{{ $customer->name }}</h1>
                <p class="dp-subtitle">{{ $customer->code ?: 'No customer code' }}</p>
            </div>
            <div class="flex flex-wrap gap-3">
                <a href="{{ route('customers.edit', $customer) }}" class="dp-btn">Edit</a>
                <a href="{{ route('invoices.create') }}" class="dp-btn-primary">New Invoice</a>
            </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div class="dp-card p-5">
                <h2 class="text-lg font-semibold text-slate-900">Profile</h2>
                <dl class="mt-5 space-y-4 text-sm">
                    <div>
                        <dt class="text-slate-500">Contact person</dt>
                        <dd class="mt-1 text-slate-900">{{ $customer->contact_person ?: 'N/A' }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Phone / Email</dt>
                        <dd class="mt-1 text-slate-900">{{ $customer->phone ?: 'N/A' }}{{ $customer->email ? ' / '.$customer->email : '' }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Opening balance</dt>
                        <dd class="mt-1 text-slate-900">{{ number_format((float) $customer->opening_balance, 2) }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Credit limit</dt>
                        <dd class="mt-1 text-slate-900">{{ number_format((float) $customer->credit_limit, 2) }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Billing address</dt>
                        <dd class="mt-1 whitespace-pre-line text-slate-900">{{ $customer->billing_address ?: 'N/A' }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Shipping address</dt>
                        <dd class="mt-1 whitespace-pre-line text-slate-900">{{ $customer->shipping_address ?: 'N/A' }}</dd>
                    </div>
                </dl>
            </div>

            <div class="space-y-6">
                <div class="dp-card p-5">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-semibold text-slate-900">Recent invoices</h2>
                        <a href="{{ route('reports.customers.ledger', $customer) }}" class="dp-btn">Ledger</a>
                    </div>
                    <div class="mt-4 space-y-3">
                        @forelse ($customer->invoices as $invoice)
                            <a href="{{ route('invoices.show', $invoice) }}" class="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div class="flex items-center justify-between gap-3">
                                    <div>
                                        <div class="font-medium text-slate-900">{{ $invoice->invoice_number }}</div>
                                        <div class="text-sm text-slate-500">{{ $invoice->issue_date?->format('d M Y') }}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-semibold text-slate-900">{{ number_format((float) $invoice->total, 2) }}</div>
                                        <div class="text-xs text-slate-500">Balance {{ number_format((float) $invoice->balance_due, 2) }}</div>
                                    </div>
                                </div>
                            </a>
                        @empty
                            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">No invoices recorded yet.</div>
                        @endforelse
                    </div>
                </div>

                <div class="dp-card p-5">
                    <h2 class="text-lg font-semibold text-slate-900">Recent payments</h2>
                    <div class="mt-4 space-y-3">
                        @forelse ($customer->payments as $payment)
                            <a href="{{ route('payments.show', $payment) }}" class="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div class="flex items-center justify-between gap-3">
                                    <div>
                                        <div class="font-medium text-slate-900">{{ $payment->payment_number }}</div>
                                        <div class="text-sm text-slate-500">{{ $payment->payment_date?->format('d M Y') }} / {{ ucfirst($payment->method) }}</div>
                                    </div>
                                    <div class="font-semibold text-slate-900">{{ number_format((float) $payment->amount, 2) }}</div>
                                </div>
                            </a>
                        @empty
                            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">No payments recorded yet.</div>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
