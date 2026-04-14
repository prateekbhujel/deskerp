@php($active = old('is_active', $supplier->is_active ?? true))

<div class="grid gap-4 md:grid-cols-2">
    <div>
        <label class="dp-label" for="code">Code</label>
        <input class="dp-input" id="code" name="code" value="{{ old('code', $supplier->code) }}">
    </div>
    <div>
        <label class="dp-label" for="name">Supplier Name</label>
        <input class="dp-input" id="name" name="name" value="{{ old('name', $supplier->name) }}" required>
    </div>
    <div>
        <label class="dp-label" for="contact_person">Contact Person</label>
        <input class="dp-input" id="contact_person" name="contact_person" value="{{ old('contact_person', $supplier->contact_person) }}">
    </div>
    <div>
        <label class="dp-label" for="phone">Phone</label>
        <input class="dp-input" id="phone" name="phone" value="{{ old('phone', $supplier->phone) }}">
    </div>
    <div>
        <label class="dp-label" for="email">Email</label>
        <input class="dp-input" id="email" type="email" name="email" value="{{ old('email', $supplier->email) }}">
    </div>
    <div>
        <label class="dp-label" for="tax_number">Tax Number</label>
        <input class="dp-input" id="tax_number" name="tax_number" value="{{ old('tax_number', $supplier->tax_number) }}">
    </div>
    <div>
        <label class="dp-label" for="opening_balance">Opening Balance</label>
        <input class="dp-input" id="opening_balance" type="number" step="0.01" min="0" name="opening_balance" value="{{ old('opening_balance', $supplier->opening_balance ?? 0) }}">
    </div>
    <div class="md:col-span-2">
        <label class="dp-label" for="billing_address">Billing Address</label>
        <textarea class="dp-textarea" id="billing_address" name="billing_address" rows="3">{{ old('billing_address', $supplier->billing_address) }}</textarea>
    </div>
    <div class="md:col-span-2">
        <label class="dp-label" for="notes">Notes</label>
        <textarea class="dp-textarea" id="notes" name="notes" rows="3">{{ old('notes', $supplier->notes) }}</textarea>
    </div>
</div>

<input type="hidden" name="is_active" value="0">
<label class="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
    <input type="checkbox" class="rounded border-slate-300 text-teal-700 focus:ring-teal-700" name="is_active" value="1" @checked($active)>
    <span>Supplier is active and available for payments</span>
</label>

<div class="mt-6 flex flex-wrap gap-3">
    <button type="submit" class="dp-btn-primary">{{ $submitLabel }}</button>
    <a href="{{ $cancelUrl }}" class="dp-btn">Cancel</a>
</div>
