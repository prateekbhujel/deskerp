@extends('layouts.app')

@section('title', 'Add Supplier')

@section('content')
    <section class="dp-section">
        <div>
            <h1 class="dp-title">Add Supplier</h1>
            <p class="dp-subtitle">Create a supplier profile for payment entries and ledger tracking.</p>
        </div>

        <form method="POST" action="{{ route('suppliers.store') }}" class="dp-card p-5">
            @csrf
            @include('suppliers._form', [
                'supplier' => $supplier,
                'submitLabel' => 'Create Supplier',
                'cancelUrl' => route('suppliers.index'),
            ])
        </form>
    </section>
@endsection
