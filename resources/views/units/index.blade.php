@extends('layouts.app')

@section('title', 'Units')

@section('content')
    <section class="dp-section">
        <div class="dp-toolbar">
            <div>
                <h1 class="dp-title">Units</h1>
                <p class="dp-subtitle">Define measurement units used by inventory items and invoice lines.</p>
            </div>
            <a href="{{ route('units.create') }}" class="dp-btn-primary">Add Unit</a>
        </div>

        <form method="GET" class="dp-card p-4">
            <div class="grid gap-4 md:grid-cols-[2fr_auto]">
                <div>
                    <label class="dp-label" for="q">Search</label>
                    <input class="dp-input" id="q" name="q" value="{{ request('q') }}" placeholder="Unit name or code">
                </div>
                <div class="flex items-end gap-3">
                    <button type="submit" class="dp-btn-primary">Filter</button>
                    <a href="{{ route('units.index') }}" class="dp-btn">Reset</a>
                </div>
            </div>
        </form>

        <div class="dp-table-wrap">
            <table class="dp-table">
                <thead>
                    <tr>
                        <th>Unit</th>
                        <th>Code</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($units as $unit)
                        <tr>
                            <td>
                                <div class="font-medium text-slate-900">{{ $unit->name }}</div>
                                <div class="text-xs text-slate-500">{{ $unit->description ?: 'No description' }}</div>
                            </td>
                            <td>{{ $unit->code }}</td>
                            <td>
                                <span class="dp-badge {{ $unit->is_active ? 'dp-badge-success' : 'dp-badge-neutral' }}">
                                    {{ $unit->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="text-right">
                                <a href="{{ route('units.show', $unit) }}" class="font-medium text-teal-700 hover:text-teal-800">Open</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="text-center text-slate-500">No units found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{ $units->links() }}
    </section>
@endsection
