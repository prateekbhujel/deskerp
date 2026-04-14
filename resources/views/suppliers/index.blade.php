@extends('layouts.app')

@section('title', 'Suppliers')

@section('content')
    <section class="dp-section">
        <div class="dp-toolbar">
            <div>
                <h1 class="dp-title">Suppliers</h1>
                <p class="dp-subtitle">Maintain supplier profiles for outbound payments and future purchasing flows.</p>
            </div>
            <a href="{{ route('suppliers.create') }}" class="dp-btn-primary">Add Supplier</a>
        </div>

        <form method="GET" class="dp-card p-4">
            <div class="grid gap-4 md:grid-cols-[2fr_1fr_auto]">
                <div>
                    <label class="dp-label" for="q">Search</label>
                    <input class="dp-input" id="q" name="q" value="{{ request('q') }}" placeholder="Name, code, phone, email">
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
                    <a href="{{ route('suppliers.index') }}" class="dp-btn">Reset</a>
                </div>
            </div>
        </form>

        <div class="dp-table-wrap">
            <table class="dp-table">
                <thead>
                    <tr>
                        <th>Supplier</th>
                        <th>Contact</th>
                        <th>Opening Balance</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($suppliers as $supplier)
                        <tr>
                            <td>
                                <div class="font-medium text-slate-900">{{ $supplier->name }}</div>
                                <div class="text-xs text-slate-500">{{ $supplier->code ?: 'No code' }}</div>
                            </td>
                            <td>
                                <div>{{ $supplier->phone ?: 'N/A' }}</div>
                                <div class="text-xs text-slate-500">{{ $supplier->email ?: 'No email' }}</div>
                            </td>
                            <td>{{ number_format((float) $supplier->opening_balance, 2) }}</td>
                            <td>
                                <span class="dp-badge {{ $supplier->is_active ? 'dp-badge-success' : 'dp-badge-neutral' }}">
                                    {{ $supplier->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="text-right">
                                <a href="{{ route('suppliers.show', $supplier) }}" class="font-medium text-teal-700 hover:text-teal-800">Open</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center text-slate-500">No suppliers found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{ $suppliers->links() }}
    </section>
@endsection
