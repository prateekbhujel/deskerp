<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'DeskPro') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased">
        <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.14),_transparent_35%),linear-gradient(180deg,_#f8fafc,_#e2e8f0)]">
            <div class="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
                <div class="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div class="hidden rounded-[2rem] border border-white/60 bg-white/60 p-10 shadow-xl backdrop-blur lg:block">
                        <div class="mb-10 inline-flex rounded-2xl border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                            DeskPro
                        </div>

                        <h1 class="max-w-xl text-4xl font-semibold tracking-tight text-slate-900">
                            Dense, practical accounting software built for local-first business workflows.
                        </h1>

                        <p class="mt-4 max-w-xl text-base leading-7 text-slate-600">
                            Run DeskPro in the browser during development, keep data in SQLite, and prepare the same core app for Windows desktop bundling later.
                        </p>

                        <div class="mt-10 grid gap-4 md:grid-cols-2">
                            <div class="dp-card-soft p-5">
                                <div class="text-sm font-semibold text-slate-900">Local authentication</div>
                                <div class="mt-2 text-sm text-slate-500">Session-based login with a seeded admin account and role-ready user model.</div>
                            </div>
                            <div class="dp-card-soft p-5">
                                <div class="text-sm font-semibold text-slate-900">Accounting flow first</div>
                                <div class="mt-2 text-sm text-slate-500">Invoices, payments, inventory, reports, exports, and backup live in one lean stack.</div>
                            </div>
                        </div>
                    </div>

                    <div class="mx-auto w-full max-w-md">
                        <div class="mb-6 text-center lg:text-left">
                            <a href="{{ route('login') }}" class="inline-flex items-center gap-3 text-slate-900">
                                <x-application-logo class="h-12 w-12" />
                                <div>
                                    <div class="text-xl font-semibold tracking-tight">DeskPro</div>
                                    <div class="text-sm text-slate-500">Local-first accounting MVP</div>
                                </div>
                            </a>
                        </div>

                        <div class="rounded-[2rem] border border-white/60 bg-white/90 px-6 py-8 shadow-xl backdrop-blur sm:px-8">
                            {{ $slot }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
