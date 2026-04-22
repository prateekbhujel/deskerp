<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingsRequest;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(
        private readonly SettingsService $settingsService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Settings/Index', [
            'settingsForm' => [
                'companyName' => $this->settingsService->get('company_name', 'DeskERP'),
                'businessAddress' => $this->settingsService->get('business_address', ''),
                'businessPhone' => $this->settingsService->get('business_phone', ''),
                'businessEmail' => $this->settingsService->get('business_email', ''),
                'fiscalYearLabel' => $this->settingsService->get('fiscal_year_label', ''),
                'fiscalYearStartDate' => $this->settingsService->get('fiscal_year_start_date', ''),
                'fiscalYearEndDate' => $this->settingsService->get('fiscal_year_end_date', ''),
                'displayBsDates' => $this->settingsService->bool('display_bs_dates', false),
                'invoicePrefix' => $this->settingsService->get('invoice_prefix', 'INV'),
                'paymentReceivedPrefix' => $this->settingsService->get('payment_received_prefix', 'REC'),
                'paymentMadePrefix' => $this->settingsService->get('payment_made_prefix', 'PAY'),
                'currency' => $this->settingsService->get('currency', 'NPR'),
            ],
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'username', 'role', 'is_active', 'last_login_at'])->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'last_login_at' => optional($user->last_login_at)->format('Y-m-d H:i'),
            ]),
            'canManageUsers' => request()->user()?->role === 'admin',
        ]);
    }

    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $settings = [
            'company_name' => $validated['company_name'] ?? 'DeskERP',
            'business_address' => $validated['business_address'] ?? '',
            'business_phone' => $validated['business_phone'] ?? '',
            'business_email' => $validated['business_email'] ?? '',
            'fiscal_year_label' => $validated['fiscal_year_label'] ?? '',
            'fiscal_year_start_date' => $validated['fiscal_year_start_date'] ?? '',
            'fiscal_year_end_date' => $validated['fiscal_year_end_date'] ?? '',
            'display_bs_dates' => $request->boolean('display_bs_dates', false) ? '1' : '0',
            'invoice_prefix' => $validated['invoice_prefix'] ?? 'INV',
            'payment_received_prefix' => $validated['payment_received_prefix'] ?? 'REC',
            'payment_made_prefix' => $validated['payment_made_prefix'] ?? 'PAY',
            'currency' => strtoupper((string) ($validated['currency'] ?? 'NPR')),
        ];

        foreach ($settings as $key => $value) {
            $this->settingsService->set($key, (string) $value);
        }

        return redirect()
            ->route('settings.index')
            ->with('success', 'Settings updated successfully.');
    }

    public function storeUser(Request $request): RedirectResponse
    {
        if ($request->user()?->role !== 'admin') {
            abort(403, 'Only admin can manage users.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:120', 'alpha_dash', Rule::unique('users', 'username')],
            'role' => ['required', Rule::in(['admin', 'data_entry', 'view_only'])],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        User::query()->create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => "{$validated['username']}@deskerp.local",
            'role' => $validated['role'],
            'is_active' => $request->boolean('is_active', true),
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('settings.index')->with('success', 'User created successfully.');
    }

    public function updateUser(Request $request, User $user): RedirectResponse
    {
        if ($request->user()?->role !== 'admin') {
            abort(403, 'Only admin can manage users.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', Rule::in(['admin', 'data_entry', 'view_only'])],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $user->name = $validated['name'];
        $user->role = $validated['role'];
        $user->is_active = $request->boolean('is_active', true);

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->route('settings.index')->with('success', 'User updated successfully.');
    }
}
