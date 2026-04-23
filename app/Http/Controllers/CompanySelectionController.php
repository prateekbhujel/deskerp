<?php

namespace App\Http\Controllers;

use App\Http\Requests\SetupCompanyRequest;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class CompanySelectionController extends Controller
{
    public function __construct(
        private readonly SettingsService $settingsService,
    ) {}

    public function index(Request $request): View|RedirectResponse
    {
        if ((bool) $request->session()->get('company_selected', false) && $request->user()) {
            return redirect()->route('dashboard');
        }

        $companyName = (string) $this->settingsService->get('company_name', '');

        return view('company.select', [
            'hasCompany' => trim($companyName) !== '',
            'company' => [
                'name' => $companyName,
                'fiscalYearLabel' => (string) $this->settingsService->get('fiscal_year_label', ''),
            ],
        ]);
    }

    public function select(Request $request): RedirectResponse
    {
        if (trim((string) $this->settingsService->get('company_name', '')) === '') {
            return redirect()->route('company.select')->withErrors([
                'company_name' => 'Company setup is required before sign in.',
            ]);
        }

        $request->session()->put('company_selected', true);

        return redirect()->route('login');
    }

    public function setup(SetupCompanyRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $settings = [
            'company_name' => $validated['company_name'],
            'business_address' => $validated['business_address'] ?? '',
            'company_address' => $validated['business_address'] ?? '',
            'fiscal_year_label' => $validated['fiscal_year_label'],
            'fiscal_year_start_date' => $validated['fiscal_year_start_date'],
            'fiscal_year_end_date' => $validated['fiscal_year_end_date'],
            'display_bs_dates' => $request->boolean('display_bs_dates') ? '1' : '0',
            'currency' => strtoupper((string) ($validated['currency'] ?? 'NPR')),
            'invoice_prefix' => strtoupper((string) ($validated['invoice_prefix'] ?? 'INV')),
            'payment_received_prefix' => 'REC',
            'payment_made_prefix' => 'PAY',
        ];

        foreach ($settings as $key => $value) {
            $this->settingsService->set($key, (string) $value);
        }

        User::query()->updateOrCreate(
            ['username' => $validated['admin_username']],
            [
                'name' => $validated['admin_name'],
                'email' => "{$validated['admin_username']}@deskerp.local",
                'role' => 'admin',
                'is_active' => true,
                'password' => Hash::make($validated['admin_password']),
            ],
        );

        $request->session()->put('company_selected', true);

        return redirect()
            ->route('login')
            ->with('status', 'Company setup completed. Sign in to continue.');
    }

    public function change(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('company.select')
            ->with('status', 'Select a company profile to continue.');
    }
}
