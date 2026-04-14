@extends('layouts.app')

@section('title', 'Edit Unit')

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">Edit Unit</h1>
                <p class="dp-subtitle">Update unit labels used across items and invoices.</p>
            </div>
            <form method="POST" action="{{ route('units.destroy', $unit) }}" onsubmit="return confirm('Delete this unit?');">
                @csrf
                @method('DELETE')
                <button type="submit" class="dp-btn-danger">Delete Unit</button>
            </form>
        </div>

        <form method="POST" action="{{ route('units.update', $unit) }}" class="dp-card p-5">
            @csrf
            @method('PUT')
            @include('units._form', [
                'unit' => $unit,
                'submitLabel' => 'Update Unit',
                'cancelUrl' => route('units.show', $unit),
            ])
        </form>
    </section>
@endsection
