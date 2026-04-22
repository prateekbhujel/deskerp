<?php

namespace App\Services;

use App\Models\AppSetting;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class SettingsService
{
    public function all(): Collection
    {
        return AppSetting::query()->pluck('value', 'key');
    }

    public function get(string $key, ?string $default = null): ?string
    {
        return AppSetting::query()->where('key', $key)->value('value') ?? $default;
    }

    public function set(string $key, ?string $value): void
    {
        AppSetting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public function bool(string $key, bool $default = false): bool
    {
        $value = $this->get($key);

        if ($value === null) {
            return $default;
        }

        return filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? $default;
    }

    public function uiSettings(): array
    {
        $fiscalYear = $this->fiscalYear();

        return [
            'companyName' => $this->get('company_name', 'DeskERP'),
            'businessContact' => [
                'address' => $this->get('business_address', ''),
                'phone' => $this->get('business_phone', ''),
                'email' => $this->get('business_email', ''),
            ],
            'displayBsDates' => $this->bool('display_bs_dates', false),
            'currency' => strtoupper((string) $this->get('currency', 'NPR')),
            'fiscalYear' => $fiscalYear,
            'prefixes' => [
                'invoice' => $this->get('invoice_prefix', 'INV'),
                'paymentReceived' => $this->get('payment_received_prefix', 'REC'),
                'paymentMade' => $this->get('payment_made_prefix', 'PAY'),
            ],
            'reportDefaults' => $this->defaultReportRange(),
        ];
    }

    public function setupStatus(): array
    {
        $missing = [];

        if (blank($this->get('company_name'))) {
            $missing[] = 'Business name';
        }

        if (blank($this->get('fiscal_year_label'))) {
            $missing[] = 'Fiscal year label';
        }

        if (blank($this->get('fiscal_year_start_date')) || blank($this->get('fiscal_year_end_date'))) {
            $missing[] = 'Fiscal year date range';
        }

        return [
            'complete' => empty($missing),
            'missing' => $missing,
        ];
    }

    public function fiscalYear(): array
    {
        return [
            'label' => $this->get('fiscal_year_label'),
            'startDate' => $this->get('fiscal_year_start_date'),
            'endDate' => $this->get('fiscal_year_end_date'),
        ];
    }

    public function defaultReportRange(): array
    {
        $fiscalYear = $this->fiscalYear();

        if ($fiscalYear['startDate'] && $fiscalYear['endDate']) {
            return [
                'dateFrom' => $fiscalYear['startDate'],
                'dateTo' => $fiscalYear['endDate'],
            ];
        }

        return [
            'dateFrom' => Carbon::now()->startOfMonth()->toDateString(),
            'dateTo' => Carbon::now()->toDateString(),
        ];
    }

    public function sequenceCounterKey(string $series): string
    {
        $label = trim((string) $this->get('fiscal_year_label', ''));

        if ($label === '') {
            return "{$series}_next_number";
        }

        $sanitized = Str::of($label)
            ->replaceMatches('/[^A-Za-z0-9]+/', '-')
            ->trim('-')
            ->lower()
            ->value();

        return "{$series}_next_number_{$sanitized}";
    }
}
