@extends('layouts.app')

@section('title', $invoice->invoice_number)

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">{{ $invoice->invoice_number }}</h1>
                <p class="dp-subtitle">{{ $invoice->customer_name }} / {{ $invoice->issue_date?->format('d M Y') }}</p>
            </div>
            <div class="flex flex-wrap gap-3">
                <a href="{{ route('payments.create', ['direction' => 'received']) }}" class="dp-btn-primary">Record Receipt</a>
                <a href="{{ route('invoices.edit', $invoice) }}" class="dp-btn">Edit</a>
                <a href="{{ route('invoices.print', $invoice) }}" target="_blank" class="dp-btn">Print</a>
                <a href="{{ route('invoices.pdf', $invoice) }}" class="dp-btn">PDF</a>
            </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <div class="space-y-6">
                <div class="dp-card p-5">
                    <div class="grid gap-4 md:grid-cols-2 text-sm">
                        <div>
                            <div class="text-slate-500">Customer</div>
                            <div class="mt-1 font-medium text-slate-900">{{ $invoice->customer_name }}</div>
                        </div>
                        <div>
                            <div class="text-slate-500">Reference</div>
                            <div class="mt-1 font-medium text-slate-900">{{ $invoice->reference_number ?: 'N/A' }}</div>
                        </div>
                        <div>
                            <div class="text-slate-500">Issue Date</div>
                            <div class="mt-1 font-medium text-slate-900">{{ $invoice->issue_date?->format('d M Y') }}</div>
                        </div>
                        <div>
                            <div class="text-slate-500">Due Date</div>
                            <div class="mt-1 font-medium text-slate-900">{{ $invoice->due_date?->format('d M Y') ?: 'N/A' }}</div>
                        </div>
                        <div>
                            <div class="text-slate-500">Status</div>
                            <div class="mt-1">
                                <span class="dp-badge {{ $invoice->payment_status === 'paid' ? 'dp-badge-success' : ($invoice->status === 'draft' ? 'dp-badge-neutral' : 'dp-badge-warning') }}">
                                    {{ ucfirst($invoice->status) }} / {{ ucfirst($invoice->payment_status) }}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div class="text-slate-500">Notes</div>
                            <div class="mt-1 whitespace-pre-line text-slate-900">{{ $invoice->notes ?: 'N/A' }}</div>
                        </div>
                    </div>
                </div>

                <div class="dp-card p-5">
                    <h2 class="text-lg font-semibold text-slate-900">Line Items</h2>
                    <div class="mt-5 dp-table-wrap border-0 shadow-none">
                        <table class="dp-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Qty</th>
                                    <th>Rate</th>
                                    <th>Disc %</th>
                                    <th>Tax %</th>
                                    <th class="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($invoice->lines as $line)
                                    <tr>
                                        <td>
                                            <div class="font-medium text-slate-900">{{ $line->description }}</div>
                                            <div class="text-xs text-slate-500">{{ $line->unit_name ?: ($line->item?->unit?->code ?? 'Unit N/A') }}</div>
                                        </td>
                                        <td>{{ number_format((float) $line->quantity, 3) }}</td>
                                        <td>{{ number_format((float) $line->rate, 2) }}</td>
                                        <td>{{ number_format((float) $line->discount_percent, 2) }}</td>
                                        <td>{{ number_format((float) $line->tax_percent, 2) }}</td>
                                        <td class="text-right">{{ number_format((float) $line->total, 2) }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="space-y-6">
                <div class="dp-card p-5">
                    <h2 class="text-lg font-semibold text-slate-900">Totals</h2>
                    <dl class="mt-5 space-y-4 text-sm">
                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-slate-500">Subtotal</dt>
                            <dd class="font-medium text-slate-900">{{ number_format((float) $invoice->subtotal, 2) }}</dd>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-slate-500">Discount</dt>
                            <dd class="font-medium text-slate-900">{{ number_format((float) $invoice->discount_total, 2) }}</dd>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-slate-500">Tax</dt>
                            <dd class="font-medium text-slate-900">{{ number_format((float) $invoice->tax_total, 2) }}</dd>
                        </div>
                        <div class="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
                            <dt class="text-base font-semibold text-slate-900">Invoice Total</dt>
                            <dd class="text-base font-semibold text-slate-900">{{ number_format((float) $invoice->total, 2) }}</dd>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-slate-500">Paid</dt>
                            <dd class="font-medium text-slate-900">{{ number_format((float) $invoice->paid_total, 2) }}</dd>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-slate-500">Balance Due</dt>
                            <dd class="font-medium text-slate-900">{{ number_format((float) $invoice->balance_due, 2) }}</dd>
                        </div>
                    </dl>
                </div>

                <div class="dp-card p-5">
                    <div class="flex items-center justify-between gap-3">
                        <h2 class="text-lg font-semibold text-slate-900">Linked Payments</h2>
                        <a href="{{ route('payments.create', ['direction' => 'received']) }}" class="dp-btn">Add Payment</a>
                    </div>
                    <div class="mt-4 space-y-3">
                        @forelse ($invoice->payments as $payment)
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
                            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">No payments linked yet.</div>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
