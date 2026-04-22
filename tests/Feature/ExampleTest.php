<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_root_redirects_guests_to_company_selection(): void
    {
        $this->get('/')->assertRedirect(route('company.select', absolute: false));
    }

    public function test_root_redirects_authenticated_users_to_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession(['company_selected' => true])
            ->get('/')
            ->assertRedirect(route('dashboard', absolute: false));
    }
}
