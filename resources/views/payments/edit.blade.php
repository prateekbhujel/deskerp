@extends('layouts.app')

@section('title', 'Edit Payment')

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">Edit Payment</h1>
                <p class="dp-subtitle">{{ $payment->payment_number }}</p>
            </div>
            <form method="POST" action="{{ route('payments.destroy', $payment) }}" onsubmit="return confirm('Delete this payment?');">
                @csrf
                @method('DELETE')
                <button type="submit" class="dp-btn-danger">Delete Payment</button>
            </form>
        </div>

        <form method="POST" action="{{ route('payments.update', $payment) }}" class="dp-card p-5">
            @csrf
            @method('PUT')
            @include('payments._form', [
                'payment' => $payment,
                'customers' => $customers,
                'suppliers' => $suppliers,
                'openInvoices' => $openInvoices,
                'submitLabel' => 'Update Payment',
                'cancelUrl' => route('payments.show', $payment),
            ])
        </form>
    </section>
@endsection
