@extends('layouts.app')

@section('title', 'Items')

@section('content')
    <section class="dp-section">
        <div class="dp-toolbar">
            <div>
                <h1 class="dp-title">Items</h1>
                <p class="dp-subtitle">Products and services with pricing, tax, and inventory settings.</p>
            </div>
            <a href="{{ route('items.create') }}" class="dp-btn-primary">Add Item</a>
        </div>

        <form method="GET" class="dp-card p-4">
            <div class="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto]">
                <div>
                    <label class="dp-label" for="q">Search</label>
                    <input class="dp-input" id="q" name="q" value="{{ request('q') }}" placeholder="Item name or SKU">
                </div>
                <div>
                    <label class="dp-label" for="category_id">Category</label>
                    <select class="dp-select" id="category_id" name="category_id">
                        <option value="">All categories</option>
                        @foreach ($categories as $category)
                            <option value="{{ $category->id }}" @selected((string) request('category_id') === (string) $category->id)>{{ $category->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="dp-label" for="status">Status</label>
                    <select class="dp-select" id="status" name="status">
                        <option value="">All</option>
                        <option value="active" @selected(request('status') === 'active')>Active</option>
                        <option value="inactive" @selected(request('status') === 'inactive')>Inactive</option>
                    </select>
                </div>
                <div class="flex items-end gap-3">
                    <button type="submit" class="dp-btn-primary">Filter</button>
                    <a href="{{ route('items.index') }}" class="dp-btn">Reset</a>
                </div>
            </div>
        </form>

        <div class="dp-table-wrap">
            <table class="dp-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Unit</th>
                        <th>Sell Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($items as $item)
                        <tr>
                            <td>
                                <div class="font-medium text-slate-900">{{ $item->name }}</div>
                                <div class="text-xs text-slate-500">{{ $item->sku ?: 'No SKU' }}</div>
                            </td>
                            <td>{{ $item->category?->name ?: 'Uncategorized' }}</td>
                            <td>{{ $item->unit?->code }}</td>
                            <td>{{ number_format((float) $item->selling_price, 2) }}</td>
                            <td>{{ $item->track_inventory ? number_format((float) $item->current_stock, 3) : 'Not tracked' }}</td>
                            <td>
                                <span class="dp-badge {{ $item->is_active ? 'dp-badge-success' : 'dp-badge-neutral' }}">
                                    {{ $item->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="text-right">
                                <a href="{{ route('items.show', $item) }}" class="font-medium text-teal-700 hover:text-teal-800">Open</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-slate-500">No items found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{ $items->links() }}
    </section>
@endsection
