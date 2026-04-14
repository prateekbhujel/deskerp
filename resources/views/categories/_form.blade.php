@php($active = old('is_active', $category->is_active ?? true))

<div class="grid gap-4 md:grid-cols-2">
    <div>
        <label class="dp-label" for="name">Category Name</label>
        <input class="dp-input" id="name" name="name" value="{{ old('name', $category->name) }}" required>
    </div>
    <div>
        <label class="dp-label" for="code">Code</label>
        <input class="dp-input" id="code" name="code" value="{{ old('code', $category->code) }}">
    </div>
    <div class="md:col-span-2">
        <label class="dp-label" for="description">Description</label>
        <textarea class="dp-textarea" id="description" name="description" rows="3">{{ old('description', $category->description) }}</textarea>
    </div>
</div>

<input type="hidden" name="is_active" value="0">
<label class="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
    <input type="checkbox" class="rounded border-slate-300 text-teal-700 focus:ring-teal-700" name="is_active" value="1" @checked($active)>
    <span>Category is active</span>
</label>

<div class="mt-6 flex flex-wrap gap-3">
    <button type="submit" class="dp-btn-primary">{{ $submitLabel }}</button>
    <a href="{{ $cancelUrl }}" class="dp-btn">Cancel</a>
</div>
