@php
    $sections = [
        'Primary' => [
            ['label' => 'Dashboard', 'route' => 'dashboard', 'active' => request()->routeIs('dashboard')],
        ],
        'Masters' => [
            ['label' => 'Customers', 'route' => 'customers.index', 'active' => request()->routeIs('customers.*')],
            ['label' => 'Suppliers', 'route' => 'suppliers.index', 'active' => request()->routeIs('suppliers.*')],
            ['label' => 'Items', 'route' => 'items.index', 'active' => request()->routeIs('items.*')],
            ['label' => 'Units', 'route' => 'units.index', 'active' => request()->routeIs('units.*')],
            ['label' => 'Categories', 'route' => 'categories.index', 'active' => request()->routeIs('categories.*')],
        ],
        'Transactions' => [
            ['label' => 'Invoices', 'route' => 'invoices.index', 'active' => request()->routeIs('invoices.*')],
            ['label' => 'Payments', 'route' => 'payments.index', 'active' => request()->routeIs('payments.*')],
        ],
        'Reports' => [
            ['label' => 'Report Center', 'route' => 'reports.index', 'active' => request()->routeIs('reports.*')],
        ],
        'System' => [
            ['label' => 'Backup / Restore', 'route' => 'backups.index', 'active' => request()->routeIs('backups.*')],
            ['label' => 'Profile', 'route' => 'profile.edit', 'active' => request()->routeIs('profile.*')],
        ],
    ];

    $quickActions = [
        ['label' => 'Sales Invoice', 'route' => 'invoices.create', 'params' => [], 'hotkey' => 'Alt+N', 'primary' => true],
        ['label' => 'Receipt Entry', 'route' => 'payments.create', 'params' => ['direction' => 'received'], 'hotkey' => 'Alt+R'],
        ['label' => 'Item Master', 'route' => 'items.create', 'params' => [], 'hotkey' => 'Alt+I'],
    ];
@endphp

<aside
    class="fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r border-slate-900 bg-slate-950 text-slate-100 transition lg:static lg:translate-x-0"
    :class="{ 'translate-x-0': sidebarOpen }"
>
    <div class="flex h-full flex-col">
        <div class="flex items-center justify-between border-b border-slate-800 px-4 py-4">
            <a href="{{ route('dashboard') }}" class="flex items-center gap-3">
                <x-application-logo class="h-10 w-10" />
                <div>
                    <div class="text-lg font-semibold tracking-tight">DeskERP</div>
                    <div class="text-[11px] uppercase tracking-[0.24em] text-slate-400">Business Accounting</div>
                </div>
            </a>

            <button type="button" class="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 lg:hidden" @click="sidebarOpen = false">
                Close
            </button>
        </div>

        <div class="border-b border-slate-800 px-4 py-4">
            <div class="text-sm font-medium text-white">{{ auth()->user()?->name }}</div>
            <div class="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">{{ auth()->user()?->role ?? 'admin' }}</div>
            <div class="mt-3 flex flex-wrap gap-2">
                <span class="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-300">SQLite</span>
                <span class="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-300">Local</span>
            </div>
        </div>

        <div class="border-b border-slate-800 px-4 py-4">
            <div class="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Quick Entry</div>
            <div class="space-y-2">
                @foreach ($quickActions as $action)
                    <a
                        href="{{ route($action['route'], $action['params']) }}"
                        class="{{ $action['primary'] ?? false ? 'dp-btn-primary w-full justify-between border border-teal-600 bg-teal-700 hover:bg-teal-800' : 'w-full justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800' }}"
                        data-hotkey="alt+{{ strtolower(substr($action['hotkey'], -1)) }}"
                    >
                        <span>{{ $action['label'] }}</span>
                        <span class="dp-kbd border-white/20 bg-white/10 text-white">{{ $action['hotkey'] }}</span>
                    </a>
                @endforeach
            </div>
        </div>

        <div class="flex-1 space-y-5 overflow-y-auto px-4 py-4">
            @foreach ($sections as $heading => $links)
                <div>
                    <div class="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{{ $heading }}</div>
                    <div class="mt-2 space-y-1">
                        @foreach ($links as $link)
                            <a
                                href="{{ route($link['route']) }}"
                                class="{{ $link['active'] ? 'bg-teal-900/70 text-white shadow-sm ring-1 ring-teal-700/60' : 'text-slate-300 hover:bg-slate-900 hover:text-white' }} block rounded-md px-3 py-2 text-sm font-medium transition"
                            >
                                {{ $link['label'] }}
                            </a>
                        @endforeach
                    </div>
                </div>
            @endforeach
        </div>

        <div class="border-t border-slate-800 p-4">
            <div class="mb-3 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                DeskERP local workspace
            </div>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="w-full rounded-md border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900">
                    Log Out
                </button>
            </form>
        </div>
    </div>
</aside>

<div x-cloak x-show="sidebarOpen" class="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" @click="sidebarOpen = false"></div>
