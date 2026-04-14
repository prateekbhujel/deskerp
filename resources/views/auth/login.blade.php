<x-guest-layout>
    <div class="mb-6">
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Sign in to DeskPro</h1>
        <p class="mt-2 text-sm leading-6 text-slate-500">
            Use the seeded local admin account to access the accounting workspace.
        </p>
    </div>

    <x-auth-session-status class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}" class="space-y-5">
        @csrf

        <div>
            <label for="email" class="dp-label">Email</label>
            <input id="email" class="dp-input" type="email" name="email" value="{{ old('email', env('DESKPRO_ADMIN_EMAIL', 'admin@deskpro.local')) }}" required autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2 text-sm text-red-600" />
        </div>

        <div>
            <label for="password" class="dp-label">Password</label>
            <input id="password" class="dp-input" type="password" name="password" required autocomplete="current-password" />
            <x-input-error :messages="$errors->get('password')" class="mt-2 text-sm text-red-600" />
        </div>

        <label for="remember_me" class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <input id="remember_me" type="checkbox" class="rounded border-slate-300 text-teal-700 shadow-sm focus:ring-teal-700" name="remember">
            <span>Keep this session signed in on this device</span>
        </label>

        <button type="submit" class="dp-btn-primary w-full">
            Log In
        </button>
    </form>

    <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
        <div class="font-semibold text-slate-900">Default seeded admin</div>
        <div class="mt-1">Email: <span class="font-medium">admin@deskpro.local</span></div>
        <div>Password: <span class="font-medium">deskpro123</span></div>
    </div>
</x-guest-layout>
