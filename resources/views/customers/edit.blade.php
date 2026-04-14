@extends('layouts.app')

@section('title', 'Edit Customer')

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">Edit Customer</h1>
                <p class="dp-subtitle">Update customer profile, credit terms, and addresses.</p>
            </div>
            <form method="POST" action="{{ route('customers.destroy', $customer) }}" onsubmit="return confirm('Delete this customer?');">
                @csrf
                @method('DELETE')
                <button type="submit" class="dp-btn-danger">Delete Customer</button>
            </form>
        </div>

        <form method="POST" action="{{ route('customers.update', $customer) }}" class="dp-card p-5">
            @csrf
            @method('PUT')
            @include('customers._form', [
                'customer' => $customer,
                'submitLabel' => 'Update Customer',
                'cancelUrl' => route('customers.show', $customer),
            ])
        </form>
    </section>
@endsection
