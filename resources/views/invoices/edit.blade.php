@extends('layouts.app')

@section('title', 'Edit Invoice')

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">Edit Invoice</h1>
                <p class="dp-subtitle">{{ $invoice->invoice_number }}</p>
            </div>
            <form method="POST" action="{{ route('invoices.destroy', $invoice) }}" onsubmit="return confirm('Delete this invoice?');">
                @csrf
                @method('DELETE')
                <button type="submit" class="dp-btn-danger">Delete Draft</button>
            </form>
        </div>

        <form method="POST" action="{{ route('invoices.update', $invoice) }}" class="dp-card p-5">
            @csrf
            @method('PUT')
            @include('invoices._form', [
                'invoice' => $invoice,
                'customers' => $customers,
                'items' => $items,
                'lineItems' => $lineItems,
                'submitLabel' => 'Update Invoice',
                'cancelUrl' => route('invoices.show', $invoice),
            ])
        </form>
    </section>
@endsection
