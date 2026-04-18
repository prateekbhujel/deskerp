@extends('layouts.app')

@section('title', $supplier->name)

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">{{ $supplier->name }}</h1>
                <p class="dp-subtitle">{{ $supplier->code ?: 'No supplier code' }}</p>
            </div>
            <div class="flex flex-wrap gap-3">
                <a href="{{ route('suppliers.edit', $supplier) }}" class="dp-btn">Edit</a>
                <a href="{{ route('payments.create', ['direction' => 'made']) }}" class="dp-btn-primary">Record Payment</a>
            </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div class="dp-card p-5">
                <h2 class="text-lg font-semibold text-slate-900">Profile</h2>
                <dl class="mt-5 space-y-4 text-sm">
                    <div>
                        <dt class="text-slate-500">Contact person</dt>
                        <dd class="mt-1 text-slate-900">{{ $supplier->contact_person ?: 'N/A' }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Phone / Email</dt>
                        <dd class="mt-1 text-slate-900">{{ $supplier->phone ?: 'N/A' }}{{ $supplier->email ? ' / '.$supplier->email : '' }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Opening balance</dt>
                        <dd class="mt-1 text-slate-900">{{ number_format((float) $supplier->opening_balance, 2) }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Billing address</dt>
                        <dd class="mt-1 whitespace-pre-line text-slate-900">{{ $supplier->billing_address ?: 'N/A' }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Notes</dt>
                        <dd class="mt-1 whitespace-pre-line text-slate-900">{{ $supplier->notes ?: 'N/A' }}</dd>
                    </div>
                </dl>
            </div>

            <div class="dp-card p-5">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-slate-900">Recent payments</h2>
                    <a href="{{ route('reports.suppliers.ledger', $supplier) }}" class="dp-btn">Ledger</a>
                </div>
                <div class="mt-4 space-y-3">
                    @forelse ($supplier->payments as $payment)
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
                        <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                            No payments recorded yet. <a href="{{ route('payments.create', ['direction' => 'made']) }}" class="font-medium text-teal-700 hover:text-teal-800">Record payment</a>.
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    </section>
@endsection
