@extends('layouts.app')

@section('title', 'Inventory Report')

@section('content')
    <section class="dp-section">
        <div class="dp-toolbar">
            <div>
                <h1 class="dp-title">Inventory Report</h1>
                <p class="dp-subtitle">Current stock, reorder levels, and stock value estimate by item.</p>
            </div>
            <a href="{{ route('reports.inventory', array_merge(request()->query(), ['export' => 'csv'])) }}" class="dp-btn-primary">Export CSV</a>
        </div>

        <form method="GET" class="dp-card p-4">
            <div class="grid gap-4 md:grid-cols-[2fr_1fr_auto]">
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
                <div class="flex items-end gap-3">
                    <button type="submit" class="dp-btn-primary">Filter</button>
                    <a href="{{ route('reports.inventory') }}" class="dp-btn">Reset</a>
                </div>
            </div>
        </form>

        <div class="dp-grid">
            <div class="dp-stat">
                <div class="text-sm text-slate-500">Tracked Items</div>
                <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format($summary['tracked_items']) }}</div>
            </div>
            <div class="dp-stat">
                <div class="text-sm text-slate-500">Low Stock Items</div>
                <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ number_format($summary['low_stock_items']) }}</div>
            </div>
        </div>

        <div class="dp-table-wrap">
            <table class="dp-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Unit</th>
                        <th class="text-right">Current Stock</th>
                        <th class="text-right">Reorder Level</th>
                        <th class="text-right">Base Price</th>
                        <th class="text-right">Stock Value</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($items as $item)
                        <tr>
                            <td>
                                <a href="{{ route('items.show', $item) }}" class="font-medium text-teal-700 hover:text-teal-800">{{ $item->name }}</a>
                                <div class="text-xs text-slate-500">{{ $item->sku ?: 'No SKU' }}</div>
                            </td>
                            <td>{{ $item->category?->name ?: 'Uncategorized' }}</td>
                            <td>{{ $item->unit?->code }}</td>
                            <td class="text-right">{{ number_format((float) $item->current_stock, 3) }}</td>
                            <td class="text-right">{{ number_format((float) $item->reorder_level, 3) }}</td>
                            <td class="text-right">{{ number_format((float) $item->base_price, 2) }}</td>
                            <td class="text-right">{{ number_format((float) $item->current_stock * (float) $item->base_price, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-slate-500">No items found for the current filters.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{ $items->links() }}
    </section>
@endsection
