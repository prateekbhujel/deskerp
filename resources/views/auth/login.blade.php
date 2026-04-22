<x-guest-layout>
    <div class="mb-4 border-b border-[#999] pb-3">
        <h1 class="text-xl font-semibold tracking-tight text-[#111827]">DeskERP Login</h1>
        <p class="mt-1 text-xs text-[#6b7280]">Version {{ config('app.version', '0.0.0') }}</p>
    </div>

    <x-auth-session-status class="mb-3 border border-[#999] bg-[#f3f4f6] px-3 py-2 text-xs text-[#111827]" :status="session('status')" />

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

    <div class="mt-4 border border-[#999] bg-[#f8f8f8] px-3 py-2 text-xs text-[#4b5563]">
        <div>Default Username: <span class="font-semibold text-[#111827]">{{ env('DESKERP_ADMIN_USERNAME', 'admin') }}</span></div>
        <div>Password: <span class="font-semibold text-[#111827]">{{ env('DESKERP_ADMIN_PASSWORD', 'deskerp123') }}</span></div>
    </div>
</x-guest-layout>
