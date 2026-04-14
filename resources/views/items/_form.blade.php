@php
    $active = old('is_active', $item->is_active ?? true);
    $allowDiscount = old('allow_discount', $item->allow_discount ?? true);
    $trackInventory = old('track_inventory', $item->track_inventory ?? true);
    $priceRows = collect(old('price_tiers', $priceTiers instanceof \Illuminate\Support\Collection ? $priceTiers->map(fn ($tier) => ['label' => $tier->label, 'amount' => $tier->amount])->all() : $priceTiers))->pad(3, ['label' => '', 'amount' => '']);
@endphp

<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <div>
        <label class="dp-label" for="sku">SKU</label>
        <input class="dp-input" id="sku" name="sku" value="{{ old('sku', $item->sku) }}">
    </div>
    <div>
        <label class="dp-label" for="name">Item Name</label>
        <input class="dp-input" id="name" name="name" value="{{ old('name', $item->name) }}" required>
    </div>
    <div>
        <label class="dp-label" for="item_type">Item Type</label>
        <select class="dp-select" id="item_type" name="item_type" required>
            <option value="stockable" @selected(old('item_type', $item->item_type) === 'stockable')>Stockable</option>
            <option value="service" @selected(old('item_type', $item->item_type) === 'service')>Service</option>
        </select>
    </div>
    <div>
        <label class="dp-label" for="unit_id">Unit</label>
        <select class="dp-select" id="unit_id" name="unit_id" required>
            <option value="">Select unit</option>
            @foreach ($units as $unitOption)
                <option value="{{ $unitOption->id }}" @selected((string) old('unit_id', $item->unit_id) === (string) $unitOption->id)>{{ $unitOption->name }} ({{ $unitOption->code }})</option>
            @endforeach
        </select>
    </div>
    <div>
        <label class="dp-label" for="category_id">Category</label>
        <select class="dp-select" id="category_id" name="category_id">
            <option value="">No category</option>
            @foreach ($categories as $categoryOption)
                <option value="{{ $categoryOption->id }}" @selected((string) old('category_id', $item->category_id) === (string) $categoryOption->id)>{{ $categoryOption->name }}</option>
            @endforeach
        </select>
    </div>
    <div>
        <label class="dp-label" for="tax_rate">Tax Rate %</label>
        <input class="dp-input" id="tax_rate" type="number" step="0.01" min="0" max="100" name="tax_rate" value="{{ old('tax_rate', $item->tax_rate ?? 0) }}">
    </div>
    <div>
        <label class="dp-label" for="base_price">Base Price</label>
        <input class="dp-input" id="base_price" type="number" step="0.01" min="0" name="base_price" value="{{ old('base_price', $item->base_price ?? 0) }}">
    </div>
    <div>
        <label class="dp-label" for="selling_price">Selling Price</label>
        <input class="dp-input" id="selling_price" type="number" step="0.01" min="0" name="selling_price" value="{{ old('selling_price', $item->selling_price ?? 0) }}" required>
    </div>
    <div>
        <label class="dp-label" for="opening_stock">Opening Stock</label>
        <input class="dp-input" id="opening_stock" type="number" step="0.001" min="0" name="opening_stock" value="{{ old('opening_stock', $openingStock ?? 0) }}">
    </div>
    <div>
        <label class="dp-label" for="reorder_level">Reorder Level</label>
        <input class="dp-input" id="reorder_level" type="number" step="0.001" min="0" name="reorder_level" value="{{ old('reorder_level', $item->reorder_level ?? 0) }}">
    </div>
    <div class="xl:col-span-3">
        <label class="dp-label" for="description">Description</label>
        <textarea class="dp-textarea" id="description" name="description" rows="3">{{ old('description', $item->description) }}</textarea>
    </div>
    <div class="xl:col-span-3">
        <div class="mb-2">
            <div class="dp-label">Additional Price Tiers</div>
            <p class="text-sm text-slate-500">Optional future-ready price labels such as Wholesale or Dealer.</p>
        </div>
        <div class="overflow-hidden rounded-2xl border border-slate-200">
            <table class="min-w-full divide-y divide-slate-200 text-sm">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Label</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($priceRows as $index => $row)
                        <tr class="border-t border-slate-100">
                            <td class="px-4 py-3">
                                <input class="dp-input" name="price_tiers[{{ $index }}][label]" value="{{ $row['label'] }}">
                            </td>
                            <td class="px-4 py-3">
                                <input class="dp-input" type="number" min="0" step="0.01" name="price_tiers[{{ $index }}][amount]" value="{{ $row['amount'] }}">
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="mt-5 grid gap-3 md:grid-cols-3">
    <input type="hidden" name="allow_discount" value="0">
    <label class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <input type="checkbox" class="rounded border-slate-300 text-teal-700 focus:ring-teal-700" name="allow_discount" value="1" @checked($allowDiscount)>
        <span>Allow discounts</span>
    </label>

    <input type="hidden" name="track_inventory" value="0">
    <label class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <input type="checkbox" class="rounded border-slate-300 text-teal-700 focus:ring-teal-700" name="track_inventory" value="1" @checked($trackInventory)>
        <span>Track inventory</span>
    </label>

    <input type="hidden" name="is_active" value="0">
    <label class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <input type="checkbox" class="rounded border-slate-300 text-teal-700 focus:ring-teal-700" name="is_active" value="1" @checked($active)>
        <span>Item is active</span>
    </label>
</div>

<div class="mt-6 flex flex-wrap gap-3">
    <button type="submit" class="dp-btn-primary">{{ $submitLabel }}</button>
    <a href="{{ $cancelUrl }}" class="dp-btn">Cancel</a>
</div>
