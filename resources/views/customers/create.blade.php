@extends('layouts.app')

@section('title', 'Add Customer')

@section('content')
    <section class="dp-section">
        <div>
            <h1 class="dp-title">Add Customer</h1>
            <p class="dp-subtitle">Create a customer profile for invoices and payment tracking.</p>
        </div>

        <form method="POST" action="{{ route('customers.store') }}" class="dp-card p-5">
            @csrf
            @include('customers._form', [
                'customer' => $customer,
                'submitLabel' => 'Create Customer',
                'cancelUrl' => route('customers.index'),
            ])
        </form>
    </section>
@endsection
