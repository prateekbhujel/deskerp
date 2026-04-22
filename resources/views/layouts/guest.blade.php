<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'DeskERP') }}</title>

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="antialiased">
        <div class="min-h-screen bg-[#f8f8f8] text-[#111827]">
            <div class="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-6">
                <div class="w-full border border-[#999] bg-white p-4">
                    {{ $slot }}
                </div>
            </div>
        </div>
    </body>
</html>
