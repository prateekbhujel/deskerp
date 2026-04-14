@extends('layouts.app')

@section('title', 'Supplier Ledger')

@section('content')
    <section class="dp-section">
        <div class="dp-toolbar">
            <div>
                <h1 class="dp-title">Supplier Ledger</h1>
                <p class="dp-subtitle">{{ $supplier->name }}</p>
            </div>
            <a href="{{ route('reports.suppliers.ledger', [$supplier, 'export' => 'csv'] + request()->query()) }}" class="dp-btn-primary">Export CSV</a>
        </div>

        <form method="GET" class="dp-card p-4">
            <div class="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                <div>
                    <label class="dp-label" for="date_from">From</label>
                    <input class="dp-input" id="date_from" type="date" name="date_from" value="{{ request('date_from') }}">
                </div>
                <div>
                    <label class="dp-label" for="date_to">To</label>
                    <input class="dp-input" id="date_to" type="date" name="date_to" value="{{ request('date_to') }}">
                </div>
                <div class="flex items-end gap-3">
                    <button type="submit" class="dp-btn-primary">Filter</button>
                    <a href="{{ route('reports.suppliers.ledger', $supplier) }}" class="dp-btn">Reset</a>
                </div>
            </div>
        </form>

        <div class="dp-table-wrap">
            <table class="dp-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Reference</th>
                        <th class="text-right">Debit</th>
                        <th class="text-right">Credit</th>
                        <th class="text-right">Balance</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($ledger as $entry)
                        <tr>
                            <td>{{ $entry['date'] ?: 'Opening' }}</td>
                            <td>{{ $entry['type'] }}</td>
                            <td>{{ $entry['reference'] }}</td>
                            <td class="text-right">{{ $entry['debit'] }}</td>
                            <td class="text-right">{{ $entry['credit'] }}</td>
                            <td class="text-right">{{ $entry['balance'] }}</td>
                            <td>{{ $entry['notes'] ?: 'N/A' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </section>
@endsection
