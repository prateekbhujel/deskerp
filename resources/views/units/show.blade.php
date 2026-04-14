@extends('layouts.app')

@section('title', $unit->name)

@section('content')
    <section class="dp-section">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 class="dp-title">{{ $unit->name }}</h1>
                <p class="dp-subtitle">{{ $unit->code }}</p>
            </div>
            <a href="{{ route('units.edit', $unit) }}" class="dp-btn">Edit</a>
        </div>

        <div class="dp-card p-5">
            <dl class="grid gap-5 md:grid-cols-3">
                <div>
                    <dt class="text-sm text-slate-500">Code</dt>
                    <dd class="mt-1 font-medium text-slate-900">{{ $unit->code }}</dd>
                </div>
                <div>
                    <dt class="text-sm text-slate-500">Status</dt>
                    <dd class="mt-1 font-medium text-slate-900">{{ $unit->is_active ? 'Active' : 'Inactive' }}</dd>
                </div>
                <div>
                    <dt class="text-sm text-slate-500">Used by items</dt>
                    <dd class="mt-1 font-medium text-slate-900">{{ $unit->items_count }}</dd>
                </div>
                <div class="md:col-span-3">
                    <dt class="text-sm text-slate-500">Description</dt>
                    <dd class="mt-1 whitespace-pre-line text-slate-900">{{ $unit->description ?: 'N/A' }}</dd>
                </div>
            </dl>
        </div>
    </section>
@endsection
