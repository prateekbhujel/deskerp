@php
    $sections = [
        'TRANSACTIONS' => [
            ['label' => 'Sales Voucher', 'route' => 'invoices.create', 'active' => request()->routeIs('invoices.create')],
            ['label' => 'Receive Payment', 'route' => 'payments.create', 'params' => ['direction' => 'received'], 'active' => request()->routeIs('payments.create') && request('direction') === 'received'],
            ['label' => 'Make Payment', 'route' => 'payments.create', 'params' => ['direction' => 'made'], 'active' => request()->routeIs('payments.create') && request('direction') === 'made'],
            ['label' => 'Invoices Register', 'route' => 'invoices.index', 'active' => request()->routeIs('invoices.index')],
            ['label' => 'Payments Register', 'route' => 'payments.index', 'active' => request()->routeIs('payments.index')],
        ],
        'MASTERS' => [
            ['label' => 'Customers', 'route' => 'customers.index', 'active' => request()->routeIs('customers.*')],
            ['label' => 'Suppliers', 'route' => 'suppliers.index', 'active' => request()->routeIs('suppliers.*')],
            ['label' => 'Items & Pricing', 'route' => 'items.index', 'active' => request()->routeIs('items.*')],
            ['label' => 'Units', 'route' => 'units.index', 'active' => request()->routeIs('units.*')],
            ['label' => 'Categories', 'route' => 'categories.index', 'active' => request()->routeIs('categories.*')],
        ],
        'REPORTS' => [
            ['label' => 'Main Reports', 'route' => 'reports.index', 'active' => request()->routeIs('reports.index')],
            ['label' => 'Sales Register', 'route' => 'reports.sales', 'active' => request()->routeIs('reports.sales')],
            ['label' => 'Payment Report', 'route' => 'reports.payments', 'active' => request()->routeIs('reports.payments')],
            ['label' => 'Stock Summary', 'route' => 'reports.inventory', 'active' => request()->routeIs('reports.inventory')],
        ],
        'SYSTEM' => [
            ['label' => 'Main Menu', 'route' => 'dashboard', 'active' => request()->routeIs('dashboard')],
            ['label' => 'Settings', 'route' => 'settings.index', 'active' => request()->routeIs('settings.*')],
            ['label' => 'Backup / Restore', 'route' => 'backups.index', 'active' => request()->routeIs('backups.*')],
        ],
    ];
@endphp

<aside
    class="fixed inset-y-0 left-0 z-40 w-[220px] -translate-x-full lg:static lg:translate-x-0"
    :class="{ 'translate-x-0': sidebarOpen }"
>
    <div class="dp-sidebar">
        <div class="dp-sidebar-header">
            <span class="dp-sidebar-title">DESKERP</span>
            <button type="button" class="dp-btn lg:hidden" @click="sidebarOpen = false">Close</button>
        </div>

        @foreach ($sections as $heading => $links)
            <section class="dp-sidebar-group">
                <h3 class="dp-sidebar-group-title">{{ $heading }}</h3>
                @foreach ($links as $link)
                    <a
                        href="{{ route($link['route'], $link['params'] ?? []) }}"
                        class="dp-nav-link"
                        data-active="{{ $link['active'] ? 'true' : 'false' }}"
                    >
                        {{ $link['label'] }}
                    </a>
                @endforeach
            </section>
        @endforeach

        <div class="dp-sidebar-footer">
            <div>{{ auth()->user()?->name }}</div>
            <div style="margin-top:6px">
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="dp-btn">Log Out</button>
                </form>
            </div>
        </div>
    </div>
</aside>

<div x-cloak x-show="sidebarOpen" class="fixed inset-0 z-30 bg-black/50 lg:hidden" @click="sidebarOpen = false"></div>
