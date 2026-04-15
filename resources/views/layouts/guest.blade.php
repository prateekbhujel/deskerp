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
            <div class="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
                <div class="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div class="hidden rounded-2xl border border-slate-300/80 bg-white/80 p-8 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur lg:block">
                        <div class="mb-8 inline-flex rounded-md border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">
                            DeskERP
                        </div>

                        <h1 class="max-w-xl text-3xl font-semibold tracking-tight text-slate-900">
                            Local business accounting with fast entry, printable invoices, and lean inventory control.
                        </h1>

                        <p class="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                            Develop in the browser on macOS, keep the data local in SQLite, and ship the same core app inside a Windows desktop wrapper later.
                        </p>

                        <div class="mt-8 grid gap-4 md:grid-cols-2">
                            <div class="dp-card-soft p-5">
                                <div class="text-sm font-semibold text-slate-900">Daily workflow</div>
                                <div class="mt-2 text-sm text-slate-500">Masters, invoices, payments, stock, reports, backup, and restore inside one compact workspace.</div>
                            </div>
                            <div class="dp-card-soft p-5">
                                <div class="text-sm font-semibold text-slate-900">Local control</div>
                                <div class="mt-2 text-sm text-slate-500">Session auth, CSV export, invoice PDF, and SQLite data without a hosted backend.</div>
                            </div>
                        </div>

                        <div class="mt-8 rounded-xl border border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                            <div class="dp-label !mb-2">System Notes</div>
                            <div class="space-y-2">
                                <div class="flex items-center justify-between gap-4">
                                    <span>Mode</span>
                                    <span class="dp-mono text-slate-800">Browser First</span>
                                </div>
                                <div class="flex items-center justify-between gap-4">
                                    <span>Database</span>
                                    <span class="dp-mono text-slate-800">SQLite</span>
                                </div>
                                <div class="flex items-center justify-between gap-4">
                                    <span>Desktop Target</span>
                                    <span class="dp-mono text-slate-800">Windows Wrapper</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mx-auto w-full max-w-md">
                        <div class="mb-6 text-center lg:text-left">
                            <a href="{{ route('login') }}" class="inline-flex items-center gap-3 text-slate-900">
                                <x-application-logo class="h-12 w-12" />
                                <div>
                                    <div class="text-xl font-semibold tracking-tight">DeskERP</div>
                                    <div class="text-sm text-slate-500">Local business accounting</div>
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
