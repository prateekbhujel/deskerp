<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ trim($__env->yieldContent('title')) ? trim($__env->yieldContent('title')).' | ' : '' }}{{ config('app.name', 'DeskERP') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=ibm-plex-sans:400,500,600,700|ibm-plex-mono:400,500&display=swap" rel="stylesheet" />

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="antialiased">
        <div x-data="{ sidebarOpen: false }" class="dp-shell lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
            @include('layouts.navigation')

            <div class="min-w-0">
                <header class="sticky top-0 z-20 border-b border-slate-300/90 bg-slate-100/95 backdrop-blur">
                    <div class="space-y-3 px-4 py-3 lg:px-6">
                        <div class="flex items-center justify-between gap-4">
                            <div class="flex min-w-0 items-center gap-3">
                            <button type="button" class="dp-btn lg:hidden" @click="sidebarOpen = true">
                                Menu
                            </button>

                                <div class="min-w-0">
                                    <div class="truncate text-lg font-semibold text-slate-900">
                                        @isset($header)
                                            {{ trim(strip_tags($header)) }}
                                        @else
                                            {{ trim($__env->yieldContent('title', 'DeskERP')) }}
                                        @endisset
                                    </div>
                                    <div class="truncate text-sm text-slate-500">
                                        Dense local accounting workspace built for fast daily entry
                                    </div>
                                </div>
                            </div>

                            <div class="hidden text-right text-sm text-slate-500 sm:block">
                                <div>{{ now()->format('d M Y') }}</div>
                                <div>{{ auth()->user()?->name }}</div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                            <div class="flex flex-wrap gap-2">
                                <span class="dp-chip">Browser Mode</span>
                                <span class="dp-chip">SQLite</span>
                                <span class="dp-chip">Single Business</span>
                                <span class="dp-chip">Session Auth</span>
                            </div>

                            <div class="flex flex-wrap gap-2">
                                <a href="{{ route('invoices.create') }}" class="dp-btn-primary" data-hotkey="alt+n">
                                    New Invoice
                                    <span class="dp-kbd">Alt+N</span>
                                </a>
                                <a href="{{ route('payments.create', ['direction' => 'received']) }}" class="dp-btn" data-hotkey="alt+r">
                                    Payment Received
                                    <span class="dp-kbd">Alt+R</span>
                                </a>
                                <a href="{{ route('items.create') }}" class="dp-btn" data-hotkey="alt+i">
                                    New Item
                                    <span class="dp-kbd">Alt+I</span>
                                </a>
                                <a href="{{ route('reports.index') }}" class="dp-btn" data-hotkey="alt+g">
                                    Reports
                                    <span class="dp-kbd">Alt+G</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </header>

                <main class="space-y-5 px-4 py-5 lg:px-6">
                    @include('partials.flash')

                    @isset($slot)
                        {{ $slot }}
                    @else
                        @yield('content')
                    @endisset
                </main>
            </div>
        </div>

        @stack('scripts')
    </body>
</html>
