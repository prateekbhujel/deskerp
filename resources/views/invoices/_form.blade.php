@php
    $baseLines = collect(old('lines', collect($lineItems)->map(function ($line) {
        if (! $line) {
            return [];
        }

        return [
            'item_id' => $line->item_id,
            'description' => $line->description,
            'unit_name' => $line->unit_name,
            'quantity' => $line->quantity,
            'rate' => $line->rate,
            'discount_percent' => $line->discount_percent,
            'tax_percent' => $line->tax_percent,
        ];
    })->all()))
    ->map(fn ($line) => array_merge([
        'item_id' => '',
        'description' => '',
        'unit_name' => '',
        'quantity' => '',
        'rate' => '',
        'discount_percent' => '0',
        'tax_percent' => '0',
    ], $line))
    ->pad(12, [
        'item_id' => '',
        'description' => '',
        'unit_name' => '',
        'quantity' => '',
        'rate' => '',
        'discount_percent' => '0',
        'tax_percent' => '0',
    ]);
@endphp

<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <div class="xl:col-span-2">
        <label class="dp-label" for="customer_id">Customer</label>
        <select class="dp-select" id="customer_id" name="customer_id" required>
            <option value="">Select customer</option>
            @foreach ($customers as $customer)
                <option value="{{ $customer->id }}" @selected((string) old('customer_id', $invoice->customer_id) === (string) $customer->id)>{{ $customer->name }}</option>
            @endforeach
        </select>
    </div>
    <div>
        <label class="dp-label" for="issue_date">Issue Date</label>
        <input class="dp-input" id="issue_date" type="date" name="issue_date" value="{{ old('issue_date', optional($invoice->issue_date)->format('Y-m-d') ?? $invoice->issue_date ?? now()->toDateString()) }}" required>
    </div>
    <div>
        <label class="dp-label" for="due_date">Due Date</label>
        <input class="dp-input" id="due_date" type="date" name="due_date" value="{{ old('due_date', optional($invoice->due_date)->format('Y-m-d') ?? $invoice->due_date) }}">
    </div>
    <div>
        <label class="dp-label" for="status">Status</label>
        <select class="dp-select" id="status" name="status" required>
            <option value="draft" @selected(old('status', $invoice->status) === 'draft')>Draft</option>
            <option value="final" @selected(old('status', $invoice->status) === 'final')>Final</option>
        </select>
    </div>
    <div class="xl:col-span-3">
        <label class="dp-label" for="reference_number">Reference Number</label>
        <input class="dp-input" id="reference_number" name="reference_number" value="{{ old('reference_number', $invoice->reference_number) }}">
    </div>
</div>

<div class="mt-6">
    <div class="mb-3 flex items-center justify-between gap-3">
        <div>
            <div class="dp-label !mb-0">Invoice Lines</div>
            <p class="text-sm text-slate-500">Unused rows are ignored on save. Enter rate, discount %, and tax % directly for speed.</p>
        </div>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="min-w-[980px] divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50">
                <tr>
                    <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Item</th>
                    <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                    <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Unit</th>
                    <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Qty</th>
                    <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Rate</th>
                    <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Disc %</th>
                    <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tax %</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($baseLines as $index => $line)
                    <tr class="border-t border-slate-100">
                        <td class="px-3 py-3">
                            <select class="dp-select min-w-[180px]" name="lines[{{ $index }}][item_id]">
                                <option value="">Free line</option>
                                @foreach ($items as $itemOption)
                                    <option value="{{ $itemOption->id }}" @selected((string) $line['item_id'] === (string) $itemOption->id)>{{ $itemOption->name }}</option>
                                @endforeach
                            </select>
                        </td>
                        <td class="px-3 py-3">
                            <input class="dp-input min-w-[220px]" name="lines[{{ $index }}][description]" value="{{ $line['description'] }}" placeholder="Description">
                        </td>
                        <td class="px-3 py-3">
                            <input class="dp-input min-w-[100px]" name="lines[{{ $index }}][unit_name]" value="{{ $line['unit_name'] }}" placeholder="PCS">
                        </td>
                        <td class="px-3 py-3">
                            <input class="dp-input min-w-[90px]" type="number" min="0" step="0.001" name="lines[{{ $index }}][quantity]" value="{{ $line['quantity'] }}">
                        </td>
                        <td class="px-3 py-3">
                            <input class="dp-input min-w-[110px]" type="number" min="0" step="0.01" name="lines[{{ $index }}][rate]" value="{{ $line['rate'] }}">
                        </td>
                        <td class="px-3 py-3">
                            <input class="dp-input min-w-[90px]" type="number" min="0" max="100" step="0.01" name="lines[{{ $index }}][discount_percent]" value="{{ $line['discount_percent'] }}">
                        </td>
                        <td class="px-3 py-3">
                            <input class="dp-input min-w-[90px]" type="number" min="0" max="100" step="0.01" name="lines[{{ $index }}][tax_percent]" value="{{ $line['tax_percent'] }}">
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>

<div class="mt-6">
    <label class="dp-label" for="notes">Notes</label>
    <textarea class="dp-textarea" id="notes" name="notes" rows="4">{{ old('notes', $invoice->notes) }}</textarea>
</div>

<div class="mt-6 flex flex-wrap gap-3">
    <button type="submit" class="dp-btn-primary">{{ $submitLabel }}</button>
    <a href="{{ $cancelUrl }}" class="dp-btn">Cancel</a>
    @if ($invoice->exists)
        <a href="{{ route('invoices.print', $invoice) }}" target="_blank" class="dp-btn">Print View</a>
    @endif
</div>
