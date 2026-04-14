@extends('layouts.app')

@section('title', 'Customers')

@section('content')
    <section class="dp-section">
        <div class="dp-toolbar">
            <div>
                <h1 class="dp-title">Customers</h1>
                <p class="dp-subtitle">Manage customer masters, balances, and billing details.</p>
            </div>
            <a href="{{ route('customers.create') }}" class="dp-btn-primary">Add Customer</a>
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
                    <a href="{{ route('customers.index') }}" class="dp-btn">Reset</a>
                </div>
            </div>
        </form>

        <div class="dp-table-wrap">
            <table class="dp-table">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Contact</th>
                        <th>Opening Balance</th>
                        <th>Credit Limit</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($customers as $customer)
                        <tr>
                            <td>
                                <div class="font-medium text-slate-900">{{ $customer->name }}</div>
                                <div class="text-xs text-slate-500">{{ $customer->code ?: 'No code' }}</div>
                            </td>
                            <td>
                                <div>{{ $customer->phone ?: 'N/A' }}</div>
                                <div class="text-xs text-slate-500">{{ $customer->email ?: 'No email' }}</div>
                            </td>
                            <td>{{ number_format((float) $customer->opening_balance, 2) }}</td>
                            <td>{{ number_format((float) $customer->credit_limit, 2) }}</td>
                            <td>
                                <span class="dp-badge {{ $customer->is_active ? 'dp-badge-success' : 'dp-badge-neutral' }}">
                                    {{ $customer->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="text-right">
                                <a href="{{ route('customers.show', $customer) }}" class="font-medium text-teal-700 hover:text-teal-800">Open</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center text-slate-500">No customers found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{ $customers->links() }}
    </section>
@endsection
