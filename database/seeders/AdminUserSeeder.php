<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('DESKERP_ADMIN_EMAIL', 'admin@deskerp.local')],
            [
                'name' => env('DESKERP_ADMIN_NAME', 'DeskERP Admin'),
                'username' => env('DESKERP_ADMIN_USERNAME', 'admin'),
                'role' => 'admin',
                'is_active' => true,
                'password' => Hash::make(env('DESKERP_ADMIN_PASSWORD', 'deskerp123')),
            ],
        );
    }
}
