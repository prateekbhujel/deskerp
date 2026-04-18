<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingsRequest;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
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
            ],
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
        ];

        foreach ($settings as $key => $value) {
            $this->settingsService->set($key, (string) $value);
        }

        return redirect()
            ->route('settings.index')
            ->with('success', 'Settings updated successfully.');
    }
}
