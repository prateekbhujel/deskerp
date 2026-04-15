<?php

namespace Tests\Feature\DeskERP;

use App\Models\Customer;
use App\Models\Item;
use App\Models\Unit;
use App\Models\User;
use App\Services\InvoiceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceCalculationTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoice_totals_are_calculated_correctly(): void
    {
        $user = User::factory()->create();
        $customer = Customer::query()->create(['name' => 'Acme Retail']);
        $unit = Unit::query()->create(['name' => 'Piece', 'code' => 'PCS', 'is_active' => true]);
        $item = Item::query()->create([
            'unit_id' => $unit->id,
            'name' => 'DeskERP License',
            'item_type' => 'service',
            'base_price' => 90,
            'selling_price' => 120,
            'tax_rate' => 13,
            'allow_discount' => true,
            'track_inventory' => false,
            'is_active' => true,
        ]);

        $invoice = app(InvoiceService::class)->store([
            'customer_id' => $customer->id,
            'issue_date' => now()->toDateString(),
            'status' => 'final',
            'lines' => [
                [
                    'item_id' => $item->id,
                    'description' => 'DeskERP License',
                    'unit_name' => 'PCS',
                    'quantity' => 2,
                    'rate' => 120,
                    'discount_percent' => 10,
                    'tax_percent' => 13,
                ],
            ],
        ], $user);

        $invoice->refresh();

        $this->assertSame('240.00', (string) $invoice->subtotal);
        $this->assertSame('24.00', (string) $invoice->discount_total);
        $this->assertSame('28.08', (string) $invoice->tax_total);
        $this->assertSame('244.08', (string) $invoice->total);
        $this->assertSame('244.08', (string) $invoice->balance_due);
        $this->assertSame('unpaid', $invoice->payment_status);
        $this->assertStringStartsWith('INV-', $invoice->invoice_number);
    }
}
