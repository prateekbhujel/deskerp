@extends('layouts.app')

@section('title', 'Record Payment')

@section('content')
    <section class="dp-section">
        <div>
            <h1 class="dp-title">Record Payment</h1>
            <p class="dp-subtitle">Capture money received or paid with method, reference, and invoice linkage.</p>
        </div>

        <form method="POST" action="{{ route('payments.store') }}" class="dp-card p-5">
            @csrf
            @include('payments._form', [
                'payment' => $payment,
                'customers' => $customers,
                'suppliers' => $suppliers,
                'openInvoices' => $openInvoices,
                'submitLabel' => 'Save Payment',
                'cancelUrl' => route('payments.index'),
            ])
        </form>
    </section>
@endsection
