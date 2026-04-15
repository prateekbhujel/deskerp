@extends('layouts.app')

@section('title', 'Backup / Restore')

@section('content')
    <section class="dp-section">
        <div>
            <h1 class="dp-title">Backup / Restore</h1>
            <p class="dp-subtitle">Create a manual SQLite backup and restore carefully when needed.</p>
        </div>

        <div class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div class="space-y-6">
                <div class="dp-card p-5">
                    <h2 class="text-lg font-semibold text-slate-900">Create Backup</h2>
                    <p class="mt-2 text-sm text-slate-500">DeskERP will copy the current local SQLite database into a downloadable backup file.</p>
                    <form method="POST" action="{{ route('backups.store') }}" class="mt-5">
                        @csrf
                        <button type="submit" class="dp-btn-primary">Download Backup</button>
                    </form>
                </div>

                <div class="dp-card p-5">
                    <h2 class="text-lg font-semibold text-slate-900">Restore Backup</h2>
                    <p class="mt-2 text-sm text-slate-500">
                        Restoring replaces the current database completely. Make sure everyone is out of the app and type <strong>RESTORE</strong> to confirm.
                    </p>
                    <form method="POST" action="{{ route('backups.restore') }}" enctype="multipart/form-data" class="mt-5 space-y-4">
                        @csrf
                        <div>
                            <label class="dp-label" for="backup_file">SQLite Backup File</label>
                            <input class="dp-input" id="backup_file" type="file" name="backup_file" required>
                        </div>
                        <div>
                            <label class="dp-label" for="confirmation_text">Type RESTORE</label>
                            <input class="dp-input" id="confirmation_text" name="confirmation_text" required>
                        </div>
                        <button type="submit" class="dp-btn-danger">Restore Backup</button>
                    </form>
                </div>
            </div>

            <div class="dp-card p-5">
                <h2 class="text-lg font-semibold text-slate-900">Recent Backups</h2>
                <div class="mt-5 space-y-3">
                    @forelse ($backups as $backup)
                        <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div class="font-medium text-slate-900">{{ $backup['name'] }}</div>
                            <div class="mt-1 text-sm text-slate-500">
                                {{ number_format($backup['size'] / 1024, 1) }} KB / {{ $backup['modified_at'] }}
                            </div>
                        </div>
                    @empty
                        <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                            No backups have been generated yet.
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    </section>
@endsection
