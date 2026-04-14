@extends('layouts.app')

@section('title', 'Categories')

@section('content')
    <section class="dp-section">
        <div class="dp-toolbar">
            <div>
                <h1 class="dp-title">Categories</h1>
                <p class="dp-subtitle">Keep item grouping lightweight and easy to filter in reports.</p>
            </div>
            <a href="{{ route('categories.create') }}" class="dp-btn-primary">Add Category</a>
        </div>

        <form method="GET" class="dp-card p-4">
            <div class="grid gap-4 md:grid-cols-[2fr_auto]">
                <div>
                    <label class="dp-label" for="q">Search</label>
                    <input class="dp-input" id="q" name="q" value="{{ request('q') }}" placeholder="Category name or code">
                </div>
                <div class="flex items-end gap-3">
                    <button type="submit" class="dp-btn-primary">Filter</button>
                    <a href="{{ route('categories.index') }}" class="dp-btn">Reset</a>
                </div>
            </div>
        </form>

        <div class="dp-table-wrap">
            <table class="dp-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Code</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($categories as $category)
                        <tr>
                            <td>
                                <div class="font-medium text-slate-900">{{ $category->name }}</div>
                                <div class="text-xs text-slate-500">{{ $category->description ?: 'No description' }}</div>
                            </td>
                            <td>{{ $category->code ?: 'N/A' }}</td>
                            <td>
                                <span class="dp-badge {{ $category->is_active ? 'dp-badge-success' : 'dp-badge-neutral' }}">
                                    {{ $category->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="text-right">
                                <a href="{{ route('categories.show', $category) }}" class="font-medium text-teal-700 hover:text-teal-800">Open</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="text-center text-slate-500">No categories found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{ $categories->links() }}
    </section>
@endsection
