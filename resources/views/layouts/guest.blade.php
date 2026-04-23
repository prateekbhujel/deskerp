<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'DeskERP') }}</title>

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    @php($settings = app(\App\Services\SettingsService::class))
    <body class="dp-guest-body antialiased">
        <div class="dp-guest-shell">
            <aside class="dp-guest-aside">
                <div>
                    <div class="dp-guest-brand">DeskERP</div>
                    <div class="mt-2 text-sm text-[#9fb0cf]">Company access and local setup</div>
                </div>

                <div class="dp-guest-meta">
                    <div>
                        <strong>Company</strong>
                        <div>{{ $settings->get('company_name', 'Not configured') }}</div>
                    </div>
                    <div>
                        <strong>Fiscal Year</strong>
                        <div>{{ $settings->get('fiscal_year_label', 'Not configured') }}</div>
                    </div>
                    <div>
                        <strong>Version</strong>
                        <div>{{ config('app.version', '0.0.0') }}</div>
                    </div>
                </div>
            </aside>

            <main class="dp-guest-main">
                <div class="dp-guest-card">
                    {{ $slot }}
                </div>
            </main>
        </div>
    </body>
</html>
