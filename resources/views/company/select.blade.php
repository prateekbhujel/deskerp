<x-guest-layout>
    <div class="mb-4 border-b border-[#d9dee8] pb-3">
        <h1 class="text-xl font-semibold text-[#0f172a]">Company Selection</h1>
        <p class="mt-1 text-sm text-[#64748b]">Open the current company profile or update the installation details.</p>
    </div>

    @if ($hasCompany)
        <section class="mb-4 space-y-3 rounded-lg border border-[#d9dee8] bg-white p-3">
            <div class="text-sm font-semibold text-[#0f172a]">Current Company</div>
            <div class="rounded-lg border border-[#e9edf4] bg-[#f8fafc] px-3 py-2 text-sm">
                <div class="font-semibold text-[#0f172a]">{{ $company['name'] }}</div>
                <div class="text-xs text-[#64748b]">Fiscal Year: {{ $company['fiscalYearLabel'] ?: 'Not set' }}</div>
            </div>

            <form method="POST" action="{{ route('company.select.store') }}">
                @csrf
                <button class="dp-btn-primary w-full justify-center" type="submit">Continue With This Company</button>
            </form>
        </section>
    @endif

    <section class="space-y-3 rounded-lg border border-[#d9dee8] bg-white p-3">
        <div class="text-sm font-semibold text-[#0f172a]">{{ $hasCompany ? 'Update Company Profile' : 'Set Up Company' }}</div>
        @if ($hasCompany)
            <div class="text-sm text-[#64748b]">Single-business mode. Saving here updates the company details used by this installation.</div>
        @endif

        <form method="POST" action="{{ route('company.setup') }}" class="space-y-3">
            @csrf

            <div class="grid gap-3 md:grid-cols-2">
                <div class="md:col-span-2">
                    <label class="dp-label" for="company_name">Company Name</label>
                    <input id="company_name" class="dp-input" type="text" name="company_name" value="{{ old('company_name') }}" required />
                    <x-input-error :messages="$errors->get('company_name')" class="mt-1 text-xs text-red-700" />
                </div>

                <div class="md:col-span-2">
                    <label class="dp-label" for="business_address">Address</label>
                    <textarea id="business_address" class="dp-input" name="business_address" rows="2">{{ old('business_address') }}</textarea>
                    <x-input-error :messages="$errors->get('business_address')" class="mt-1 text-xs text-red-700" />
                </div>

                <div>
                    <label class="dp-label" for="fiscal_year_label">Fiscal Year</label>
                    <input id="fiscal_year_label" class="dp-input" type="text" name="fiscal_year_label" value="{{ old('fiscal_year_label', '2082/83') }}" required />
                    <x-input-error :messages="$errors->get('fiscal_year_label')" class="mt-1 text-xs text-red-700" />
                </div>

                <div>
                    <label class="dp-label" for="currency">Base Currency</label>
                    <input id="currency" class="dp-input" type="text" name="currency" value="{{ old('currency', 'NPR') }}" required />
                    <x-input-error :messages="$errors->get('currency')" class="mt-1 text-xs text-red-700" />
                </div>

                <div>
                    <label class="dp-label" for="fiscal_year_start_date">Fiscal Start (AD)</label>
                    <input id="fiscal_year_start_date" class="dp-input" type="date" name="fiscal_year_start_date" value="{{ old('fiscal_year_start_date') }}" required />
                    <x-input-error :messages="$errors->get('fiscal_year_start_date')" class="mt-1 text-xs text-red-700" />
                </div>

                <div>
                    <label class="dp-label" for="fiscal_year_end_date">Fiscal End (AD)</label>
                    <input id="fiscal_year_end_date" class="dp-input" type="date" name="fiscal_year_end_date" value="{{ old('fiscal_year_end_date') }}" required />
                    <x-input-error :messages="$errors->get('fiscal_year_end_date')" class="mt-1 text-xs text-red-700" />
                </div>

                <div>
                    <label class="dp-label" for="invoice_prefix">Invoice Prefix</label>
                    <input id="invoice_prefix" class="dp-input" type="text" name="invoice_prefix" value="{{ old('invoice_prefix', 'INV') }}" />
                    <x-input-error :messages="$errors->get('invoice_prefix')" class="mt-1 text-xs text-red-700" />
                </div>

                <div class="flex items-end">
                    <label class="inline-flex items-center gap-2 text-xs text-[#475569]">
                        <input type="checkbox" name="display_bs_dates" value="1" @checked(old('display_bs_dates')) />
                        Display BS dates
                    </label>
                </div>

                <div>
                    <label class="dp-label" for="admin_name">Admin Name</label>
                    <input id="admin_name" class="dp-input" type="text" name="admin_name" value="{{ old('admin_name', 'DeskERP Admin') }}" required />
                    <x-input-error :messages="$errors->get('admin_name')" class="mt-1 text-xs text-red-700" />
                </div>

                <div>
                    <label class="dp-label" for="admin_username">Admin Username</label>
                    <input id="admin_username" class="dp-input" type="text" name="admin_username" value="{{ old('admin_username', 'admin') }}" required />
                    <x-input-error :messages="$errors->get('admin_username')" class="mt-1 text-xs text-red-700" />
                </div>

                <div>
                    <label class="dp-label" for="admin_password">Admin Password</label>
                    <input id="admin_password" class="dp-input" type="password" name="admin_password" required />
                    <x-input-error :messages="$errors->get('admin_password')" class="mt-1 text-xs text-red-700" />
                </div>

                <div>
                    <label class="dp-label" for="admin_password_confirmation">Confirm Password</label>
                    <input id="admin_password_confirmation" class="dp-input" type="password" name="admin_password_confirmation" required />
                </div>
            </div>

            <button class="dp-btn-primary w-full justify-center" type="submit">{{ $hasCompany ? 'Save Company Settings' : 'Create Company' }}</button>
        </form>
    </section>
</x-guest-layout>
