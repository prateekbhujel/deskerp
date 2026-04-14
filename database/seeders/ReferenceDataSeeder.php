<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class ReferenceDataSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['name' => 'Piece', 'code' => 'PCS', 'description' => 'Piece / each'],
            ['name' => 'Box', 'code' => 'BOX', 'description' => 'Box'],
            ['name' => 'Kilogram', 'code' => 'KG', 'description' => 'Kilogram'],
            ['name' => 'Hour', 'code' => 'HR', 'description' => 'Hour'],
            ['name' => 'Service', 'code' => 'SRV', 'description' => 'Service'],
        ];

        foreach ($units as $unit) {
            Unit::updateOrCreate(['code' => $unit['code']], $unit + ['is_active' => true]);
        }

        $categories = [
            ['name' => 'General', 'code' => 'GEN', 'description' => 'General products'],
            ['name' => 'Services', 'code' => 'SRV', 'description' => 'Service items'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['code' => $category['code']], $category + ['is_active' => true]);
        }
    }
}
