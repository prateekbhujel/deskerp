<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['nullable', 'string', 'max:255'],
            'business_address' => ['nullable', 'string', 'max:1000'],
            'business_phone' => ['nullable', 'string', 'max:60'],
            'business_email' => ['nullable', 'email', 'max:255'],
            'fiscal_year_label' => ['nullable', 'string', 'max:30'],
            'fiscal_year_start_date' => ['nullable', 'date'],
            'fiscal_year_end_date' => ['nullable', 'date', 'after_or_equal:fiscal_year_start_date'],
            'display_bs_dates' => ['nullable', 'boolean'],
            'invoice_prefix' => ['nullable', 'string', 'max:20'],
            'payment_received_prefix' => ['nullable', 'string', 'max:20'],
            'payment_made_prefix' => ['nullable', 'string', 'max:20'],
        ];
    }
}
