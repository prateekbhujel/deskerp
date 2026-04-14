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
            ['email' => env('DESKPRO_ADMIN_EMAIL', 'admin@deskpro.local')],
            [
                'name' => env('DESKPRO_ADMIN_NAME', 'DeskPro Admin'),
                'role' => 'admin',
                'is_active' => true,
                'password' => Hash::make(env('DESKPRO_ADMIN_PASSWORD', 'deskpro123')),
            ],
        );
    }
}
