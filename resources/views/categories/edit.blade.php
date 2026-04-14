@extends('layouts.app')

@section('title', 'Edit Category')

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">Edit Category</h1>
                <p class="dp-subtitle">Update category labels used by products and services.</p>
            </div>
            <form method="POST" action="{{ route('categories.destroy', $category) }}" onsubmit="return confirm('Delete this category?');">
                @csrf
                @method('DELETE')
                <button type="submit" class="dp-btn-danger">Delete Category</button>
            </form>
        </div>

        <form method="POST" action="{{ route('categories.update', $category) }}" class="dp-card p-5">
            @csrf
            @method('PUT')
            @include('categories._form', [
                'category' => $category,
                'submitLabel' => 'Update Category',
                'cancelUrl' => route('categories.show', $category),
            ])
        </form>
    </section>
@endsection
