<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class AppSettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'company_name' => 'DeskERP',
            'company_address' => '',
            'company_phone' => '',
            'company_email' => '',
            'company_tax_number' => '',
            'business_address' => '',
            'business_phone' => '',
            'business_email' => '',
            'display_bs_dates' => '0',
            'fiscal_year_label' => '',
            'fiscal_year_start_date' => '',
            'fiscal_year_end_date' => '',
            'invoice_prefix' => 'INV',
            'invoice_next_number' => '1',
            'payment_received_prefix' => 'REC',
            'payment_received_next_number' => '1',
            'payment_made_prefix' => 'PAY',
            'payment_made_next_number' => '1',
            'currency' => 'NPR',
        ];

        foreach ($defaults as $key => $value) {
            AppSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
