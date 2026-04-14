<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ trim($__env->yieldContent('title')) ? trim($__env->yieldContent('title')).' | ' : '' }}{{ config('app.name', 'DeskPro') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased">
        <div x-data="{ sidebarOpen: false }" class="dp-shell lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
            @include('layouts.navigation')

            <div class="min-w-0">
                <header class="sticky top-0 z-20 border-b border-slate-200/90 bg-slate-100/90 backdrop-blur">
                    <div class="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
                        <div class="flex min-w-0 items-center gap-3">
                            <button type="button" class="dp-btn lg:hidden" @click="sidebarOpen = true">
                                Menu
                            </button>

                            <div class="min-w-0">
                                <div class="truncate text-lg font-semibold text-slate-900">
                                    @isset($header)
                                        {{ trim(strip_tags($header)) }}
                                    @else
                                        {{ trim($__env->yieldContent('title', 'DeskPro')) }}
                                    @endisset
                                </div>
                                <div class="truncate text-sm text-slate-500">
                                    Local-first accounting workspace for small business operations
                                </div>
                            </div>
                        </div>

                        <div class="hidden text-right text-sm text-slate-500 sm:block">
                            <div>{{ now()->format('d M Y') }}</div>
                            <div>{{ auth()->user()?->name }}</div>
                        </div>
                    </div>
                </header>

                <main class="space-y-6 px-4 py-6 lg:px-8">
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
