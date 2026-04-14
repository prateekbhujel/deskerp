@php
    $sections = [
        'Workspace' => [
            ['label' => 'Dashboard', 'route' => 'dashboard', 'active' => request()->routeIs('dashboard')],
        ],
        'Masters' => [
            ['label' => 'Customers', 'route' => 'customers.index', 'active' => request()->routeIs('customers.*')],
            ['label' => 'Suppliers', 'route' => 'suppliers.index', 'active' => request()->routeIs('suppliers.*')],
            ['label' => 'Items', 'route' => 'items.index', 'active' => request()->routeIs('items.*')],
            ['label' => 'Units', 'route' => 'units.index', 'active' => request()->routeIs('units.*')],
            ['label' => 'Categories', 'route' => 'categories.index', 'active' => request()->routeIs('categories.*')],
        ],
        'Operations' => [
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
@endphp

<aside
    class="fixed inset-y-0 left-0 z-40 w-72 -translate-x-full border-r border-slate-800 bg-slate-950 text-slate-100 transition lg:static lg:translate-x-0"
    :class="{ 'translate-x-0': sidebarOpen }"
>
    <div class="flex h-full flex-col">
        <div class="flex items-center justify-between border-b border-slate-800 px-5 py-5">
            <a href="{{ route('dashboard') }}" class="flex items-center gap-3">
                <x-application-logo class="h-11 w-11" />
                <div>
                    <div class="text-lg font-semibold tracking-tight">DeskPro</div>
                    <div class="text-xs uppercase tracking-[0.24em] text-slate-400">Accounting MVP</div>
                </div>
            </a>

            <button type="button" class="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 lg:hidden" @click="sidebarOpen = false">
                Close
            </button>
        </div>

        <div class="border-b border-slate-800 px-5 py-4">
            <div class="text-sm font-medium text-white">{{ auth()->user()?->name }}</div>
            <div class="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">{{ auth()->user()?->role ?? 'admin' }}</div>
        </div>

        <div class="flex-1 space-y-6 overflow-y-auto px-4 py-5">
            @foreach ($sections as $heading => $links)
                <div>
                    <div class="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{{ $heading }}</div>
                    <div class="mt-2 space-y-1">
                        @foreach ($links as $link)
                            <a
                                href="{{ route($link['route']) }}"
                                class="{{ $link['active'] ? 'bg-teal-800/80 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-900 hover:text-white' }} block rounded-xl px-3 py-2.5 text-sm font-medium transition"
                            >
                                {{ $link['label'] }}
                            </a>
                        @endforeach
                    </div>
                </div>
            @endforeach
        </div>

        <div class="border-t border-slate-800 p-4">
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900">
                    Log Out
                </button>
            </form>
        </div>
    </div>
</aside>

<div x-cloak x-show="sidebarOpen" class="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" @click="sidebarOpen = false"></div>
