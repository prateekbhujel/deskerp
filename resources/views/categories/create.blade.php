@extends('layouts.app')

@section('title', 'Add Category')

@section('content')
    <section class="dp-section">
        <div>
            <h1 class="dp-title">Add Category</h1>
            <p class="dp-subtitle">Create a lightweight category for item grouping and filtering.</p>
        </div>

        <form method="POST" action="{{ route('categories.store') }}" class="dp-card p-5">
            @csrf
            @include('categories._form', [
                'category' => $category,
                'submitLabel' => 'Create Category',
                'cancelUrl' => route('categories.index'),
            ])
        </form>
    </section>
@endsection
