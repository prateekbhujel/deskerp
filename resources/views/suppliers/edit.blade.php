@extends('layouts.app')

@section('title', 'Edit Supplier')

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">Edit Supplier</h1>
                <p class="dp-subtitle">Update supplier details and opening balance.</p>
            </div>
            <form method="POST" action="{{ route('suppliers.destroy', $supplier) }}" onsubmit="return confirm('Delete this supplier?');">
                @csrf
                @method('DELETE')
                <button type="submit" class="dp-btn-danger">Delete Supplier</button>
            </form>
        </div>

        <form method="POST" action="{{ route('suppliers.update', $supplier) }}" class="dp-card p-5">
            @csrf
            @method('PUT')
            @include('suppliers._form', [
                'supplier' => $supplier,
                'submitLabel' => 'Update Supplier',
                'cancelUrl' => route('suppliers.show', $supplier),
            ])
        </form>
    </section>
@endsection
