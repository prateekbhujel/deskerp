<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class SetupCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'business_address' => ['nullable', 'string', 'max:1000'],
            'fiscal_year_label' => ['required', 'string', 'max:30'],
            'fiscal_year_start_date' => ['required', 'date'],
            'fiscal_year_end_date' => ['required', 'date', 'after_or_equal:fiscal_year_start_date'],
            'display_bs_dates' => ['nullable', 'boolean'],
            'currency' => ['nullable', 'string', 'max:12'],
            'invoice_prefix' => ['nullable', 'string', 'max:20'],
            'admin_name' => ['required', 'string', 'max:255'],
            'admin_username' => ['required', 'string', 'max:120', 'alpha_dash', 'unique:users,username'],
            'admin_password' => ['required', 'confirmed', Password::min(8)],
        ];
    }
}
