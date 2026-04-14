<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class AppSettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'company_name' => 'DeskPro',
            'company_address' => 'Local-first accounting workspace',
            'company_phone' => '',
            'company_email' => 'deskpro@example.local',
            'company_tax_number' => '',
            'invoice_prefix' => 'INV',
            'invoice_next_number' => '1',
            'payment_received_prefix' => 'REC',
            'payment_received_next_number' => '1',
            'payment_made_prefix' => 'PAY',
            'payment_made_next_number' => '1',
            'currency' => 'USD',
        ];

        foreach ($defaults as $key => $value) {
            AppSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
