@extends('layouts.app')

@section('title', 'Edit Item')

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">Edit Item</h1>
                <p class="dp-subtitle">Update pricing, tax, and stock configuration.</p>
            </div>
            <form method="POST" action="{{ route('items.destroy', $item) }}" onsubmit="return confirm('Delete this item?');">
                @csrf
                @method('DELETE')
                <button type="submit" class="dp-btn-danger">Delete Item</button>
            </form>
        </div>

        <form method="POST" action="{{ route('items.update', $item) }}" class="dp-card p-5">
            @csrf
            @method('PUT')
            @include('items._form', [
                'item' => $item,
                'units' => $units,
                'categories' => $categories,
                'openingStock' => $openingStock,
                'priceTiers' => $priceTiers,
                'submitLabel' => 'Update Item',
                'cancelUrl' => route('items.show', $item),
            ])
        </form>
    </section>
@endsection
