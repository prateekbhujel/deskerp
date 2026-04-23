<x-guest-layout>
    @php($settings = app(\App\Services\SettingsService::class))

    <div class="mb-4 border-b border-[#d9dee8] pb-3">
        <h1 class="text-xl font-semibold tracking-tight text-[#111827]">Sign In</h1>
        <p class="mt-1 text-sm text-[#64748b]">{{ $settings->get('company_name', 'DeskERP') }} @if($settings->get('fiscal_year_label')) | FY {{ $settings->get('fiscal_year_label') }} @endif</p>
    </div>

    <x-auth-session-status class="mb-3 rounded-md border border-[#d9dee8] bg-[#f8fafc] px-3 py-2 text-sm text-[#111827]" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}" class="space-y-3">
        @csrf

        <div>
            <label for="username" class="dp-label">Username</label>
            <input id="username" class="dp-input" type="text" name="username" value="{{ old('username', env('DESKERP_ADMIN_USERNAME', 'admin')) }}" required autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('username')" class="mt-1 text-xs text-red-700" />
        </div>

        <div>
            <label for="password" class="dp-label">Password</label>
            <input id="password" class="dp-input" type="password" name="password" required autocomplete="current-password" />
            <x-input-error :messages="$errors->get('password')" class="mt-1 text-xs text-red-700" />
        </div>

        <button type="submit" class="dp-btn-primary w-full justify-center">
            Log In
        </button>
    </form>

    <div class="mt-4 flex items-center justify-between gap-4 border-t border-[#e7edf5] pt-3 text-sm text-[#64748b]">
        <span>Use the admin credentials created during company setup.</span>
        <a class="dp-guest-link" href="{{ route('company.select') }}">Company Screen</a>
    </div>
</x-guest-layout>
