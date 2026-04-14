@extends('layouts.app')

@section('title', 'New Invoice')

@section('content')
    <section class="dp-section">
        <div>
            <h1 class="dp-title">New Invoice</h1>
            <p class="dp-subtitle">Build a sales invoice with line items, discounts, tax, and customer selection.</p>
        </div>

        <form method="POST" action="{{ route('invoices.store') }}" class="dp-card p-5">
            @csrf
            @include('invoices._form', [
                'invoice' => $invoice,
                'customers' => $customers,
                'items' => $items,
                'lineItems' => $lineItems,
                'submitLabel' => 'Save Invoice',
                'cancelUrl' => route('invoices.index'),
            ])
        </form>
    </section>
@endsection
