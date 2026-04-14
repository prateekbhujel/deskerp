@extends('layouts.app')

@section('title', 'Add Unit')

@section('content')
    <section class="dp-section">
        <div>
            <h1 class="dp-title">Add Unit</h1>
            <p class="dp-subtitle">Create a reusable unit for products or services.</p>
        </div>

        <form method="POST" action="{{ route('units.store') }}" class="dp-card p-5">
            @csrf
            @include('units._form', [
                'unit' => $unit,
                'submitLabel' => 'Create Unit',
                'cancelUrl' => route('units.index'),
            ])
        </form>
    </section>
@endsection
