<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'DeskERP') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=ibm-plex-sans:400,500,600,700|ibm-plex-mono:400,500&display=swap" rel="stylesheet" />

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="antialiased">
        <div class="min-h-screen bg-[linear-gradient(180deg,_#eceff4_0%,_#dee4ea_100%)]">
            <div class="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
                <div class="grid w-full gap-5 lg:grid-cols-[1fr_1.1fr]">
                    <div class="hidden rounded-2xl border border-slate-300/80 bg-white/90 p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] lg:block">
                        <div class="flex items-center gap-3">
                            <x-application-logo class="h-11 w-11" />
                            <div>
                                <div class="text-xl font-semibold tracking-tight text-slate-900">{{ config('app.name', 'DeskERP') }}</div>
                                <div class="text-xs uppercase tracking-[0.2em] text-slate-500">Accounting Workspace</div>
                            </div>
                        </div>

                        <div class="mt-7 space-y-3 text-sm text-slate-600">
                            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div class="dp-label !mb-2">Application</div>
                                <div class="flex items-center justify-between gap-4">
                                    <span>Name</span>
                                    <span class="dp-mono text-slate-900">{{ config('app.name', 'DeskERP') }}</span>
                                </div>
                                <div class="mt-2 flex items-center justify-between gap-4">
                                    <span>Version</span>
                                    <span class="dp-mono text-slate-900">{{ config('app.version', '0.0.0') }}</span>
                                </div>
                                <div class="mt-2 flex items-center justify-between gap-4">
                                    <span>Database</span>
                                    <span class="dp-mono text-slate-900">SQLite</span>
                                </div>
                            </div>
                            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                Sign in with the admin account to continue setup and daily transactions.
                            </div>
                        </div>
                    </div>

                    <div class="mx-auto w-full max-w-md">
                        <div class="mb-4 text-center lg:hidden">
                            <a href="{{ route('login') }}" class="inline-flex items-center gap-3 text-slate-900">
                                <x-application-logo class="h-11 w-11" />
                                <div class="text-left">
                                    <div class="text-xl font-semibold tracking-tight">{{ config('app.name', 'DeskERP') }}</div>
                                    <div class="text-xs uppercase tracking-[0.2em] text-slate-500">v{{ config('app.version', '0.0.0') }}</div>
                                </div>
                            </a>
                        </div>

                        <div class="rounded-2xl border border-slate-300/80 bg-white/95 px-6 py-8 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur sm:px-8">
                            {{ $slot }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
