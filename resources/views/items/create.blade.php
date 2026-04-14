@extends('layouts.app')

@section('title', 'Add Item')

@section('content')
    <section class="dp-section">
        <div>
            <h1 class="dp-title">Add Item</h1>
            <p class="dp-subtitle">Create a product or service with pricing, tax, and stock defaults.</p>
        </div>

        <form method="POST" action="{{ route('items.store') }}" class="dp-card p-5">
            @csrf
            @include('items._form', [
                'item' => $item,
                'units' => $units,
                'categories' => $categories,
                'openingStock' => $openingStock,
                'priceTiers' => $priceTiers,
                'submitLabel' => 'Create Item',
                'cancelUrl' => route('items.index'),
            ])
        </form>
    </section>
@endsection
