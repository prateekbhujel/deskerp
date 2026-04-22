<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ trim($__env->yieldContent('title')) ? trim($__env->yieldContent('title')).' | ' : '' }}{{ config('app.name', 'DeskERP') }}</title>

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="antialiased">
        <div x-data="{ sidebarOpen: false }" class="dp-shell lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
            @include('layouts.navigation')

            <div class="min-w-0">
                <header class="dp-topbar">
                    <div class="dp-topbar-left">
                        <span class="dp-topbar-title">
                            @isset($header)
                                {{ trim(strip_tags($header)) }}
                            @else
                                {{ trim($__env->yieldContent('title', 'DeskERP')) }}
                            @endisset
                        </span>
                        <span style="color:#6b7280">{{ now()->format('d M Y') }}</span>
                    </div>
                    <div class="dp-topbar-right">
                        <a href="{{ route('invoices.create') }}" class="dp-btn-primary" data-hotkey="alt+n">Invoice <span class="dp-kbd">Alt+N</span></a>
                        <a href="{{ route('payments.create', ['direction' => 'received']) }}" class="dp-btn" data-hotkey="alt+p">Payment <span class="dp-kbd">Alt+P</span></a>
                        <a href="{{ route('reports.index') }}" class="dp-btn" data-hotkey="alt+r">Reports <span class="dp-kbd">Alt+R</span></a>
                    </div>
                </header>

                <main class="dp-content">
                    @include('partials.flash')

                    @isset($slot)
                        {{ $slot }}
                    @else
                        @yield('content')
                    @endisset
                </main>

                <div class="dp-status-bar">
                    <span>FY {{ app(\App\Services\SettingsService::class)->get('fiscal_year_label', '---') }}</span>
                    <span>|</span>
                    <span>{{ auth()->user()?->name }}</span>
                    <span>|</span>
                    <span>{{ auth()->user()?->role }}</span>
                </div>
            </div>
        </div>

        @stack('scripts')
    </body>
</html>
