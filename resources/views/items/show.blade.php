@extends('layouts.app')

@section('title', $item->name)

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">{{ $item->name }}</h1>
                <p class="dp-subtitle">{{ $item->sku ?: 'No SKU' }}</p>
            </div>
            <div class="flex flex-wrap gap-3">
                <a href="{{ route('items.edit', $item) }}" class="dp-btn">Edit</a>
                <a href="{{ route('reports.inventory') }}" class="dp-btn-primary">Inventory Report</a>
            </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div class="space-y-6">
                <div class="dp-card p-5">
                    <h2 class="text-lg font-semibold text-slate-900">Item Details</h2>
                    <dl class="mt-5 grid gap-4 text-sm md:grid-cols-2">
                        <div>
                            <dt class="text-slate-500">Unit</dt>
                            <dd class="mt-1 text-slate-900">{{ $item->unit?->name }} ({{ $item->unit?->code }})</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Category</dt>
                            <dd class="mt-1 text-slate-900">{{ $item->category?->name ?: 'Uncategorized' }}</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Base price</dt>
                            <dd class="mt-1 text-slate-900">{{ number_format((float) $item->base_price, 2) }}</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Selling price</dt>
                            <dd class="mt-1 text-slate-900">{{ number_format((float) $item->selling_price, 2) }}</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Tax rate</dt>
                            <dd class="mt-1 text-slate-900">{{ number_format((float) $item->tax_rate, 2) }}%</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Current stock</dt>
                            <dd class="mt-1 text-slate-900">{{ $item->track_inventory ? number_format((float) $item->current_stock, 3) : 'Not tracked' }}</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Opening stock</dt>
                            <dd class="mt-1 text-slate-900">{{ number_format((float) $openingStock, 3) }}</dd>
                        </div>
                        <div>
                            <dt class="text-slate-500">Reorder level</dt>
                            <dd class="mt-1 text-slate-900">{{ number_format((float) $item->reorder_level, 3) }}</dd>
                        </div>
                        <div class="md:col-span-2">
                            <dt class="text-slate-500">Description</dt>
                            <dd class="mt-1 whitespace-pre-line text-slate-900">{{ $item->description ?: 'N/A' }}</dd>
                        </div>
                    </dl>
                </div>

                <div class="dp-card p-5">
                    <h2 class="text-lg font-semibold text-slate-900">Price Tiers</h2>
                    <div class="mt-4 space-y-3">
                        @forelse ($item->prices as $tier)
                            <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                                <div class="font-medium text-slate-900">{{ $tier->label }}</div>
                                <div class="text-slate-900">{{ number_format((float) $tier->amount, 2) }}</div>
                            </div>
                        @empty
                            <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">No additional price tiers configured.</div>
                        @endforelse
                    </div>
                </div>
            </div>

            <div class="dp-card p-5">
                <h2 class="text-lg font-semibold text-slate-900">Recent Stock Movements</h2>
                <div class="mt-5 dp-table-wrap border-0 shadow-none">
                    <table class="dp-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Reference</th>
                                <th class="text-right">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($item->stockMovements as $movement)
                                <tr>
                                    <td>{{ $movement->movement_date?->format('d M Y') }}</td>
                                    <td>{{ ucfirst($movement->movement_type) }}</td>
                                    <td>{{ $movement->reference_number ?: 'N/A' }}</td>
                                    <td class="text-right">{{ number_format((float) $movement->quantity_change, 3) }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center text-slate-500">No stock movements recorded yet.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
@endsection
