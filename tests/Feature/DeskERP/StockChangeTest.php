<?php

namespace Tests\Feature\DeskERP;

use App\Models\Customer;
use App\Models\Item;
use App\Models\Unit;
use App\Models\User;
use App\Services\InventoryService;
use App\Services\InvoiceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class StockChangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_final_invoice_updates_stock_and_draft_releases_it(): void
    {
        $user = User::factory()->create();
        $customer = Customer::query()->create(['name' => 'City Traders']);
        $unit = Unit::query()->create(['name' => 'Piece', 'code' => 'PCS', 'is_active' => true]);
        $item = Item::query()->create([
            'unit_id' => $unit->id,
            'name' => 'Keyboard',
            'item_type' => 'stockable',
            'base_price' => 20,
            'selling_price' => 30,
            'tax_rate' => 0,
            'allow_discount' => true,
            'track_inventory' => true,
            'is_active' => true,
        ]);

        app(InventoryService::class)->syncOpeningStock($item, 10);

        $invoice = app(InvoiceService::class)->store([
            'customer_id' => $customer->id,
            'issue_date' => now()->toDateString(),
            'status' => 'final',
            'lines' => [
                [
                    'item_id' => $item->id,
                    'description' => 'Keyboard',
                    'unit_name' => 'PCS',
                    'quantity' => 3,
                    'rate' => 30,
                    'discount_percent' => 0,
                    'tax_percent' => 0,
                ],
            ],
        ], $user);

        $item->refresh();
        $this->assertSame('7.000', (string) $item->current_stock);

        app(InvoiceService::class)->update($invoice, [
            'customer_id' => $customer->id,
            'issue_date' => now()->toDateString(),
            'status' => 'draft',
            'lines' => [
                [
                    'item_id' => $item->id,
                    'description' => 'Keyboard',
                    'unit_name' => 'PCS',
                    'quantity' => 3,
                    'rate' => 30,
                    'discount_percent' => 0,
                    'tax_percent' => 0,
                ],
            ],
        ], $user);

        $item->refresh();
        $this->assertSame('10.000', (string) $item->current_stock);
    }

    public function test_final_invoice_cannot_oversell_inventory(): void
    {
        $user = User::factory()->create();
        $customer = Customer::query()->create(['name' => 'Stock Check']);
        $unit = Unit::query()->create(['name' => 'Piece', 'code' => 'PCS', 'is_active' => true]);
        $item = Item::query()->create([
            'unit_id' => $unit->id,
            'name' => 'Monitor',
            'item_type' => 'stockable',
            'base_price' => 200,
            'selling_price' => 250,
            'tax_rate' => 0,
            'allow_discount' => true,
            'track_inventory' => true,
            'is_active' => true,
        ]);

        app(InventoryService::class)->syncOpeningStock($item, 2);

        try {
            app(InvoiceService::class)->store([
                'customer_id' => $customer->id,
                'issue_date' => now()->toDateString(),
                'status' => 'final',
                'lines' => [
                    [
                        'item_id' => $item->id,
                        'description' => 'Monitor',
                        'unit_name' => 'PCS',
                        'quantity' => 10,
                        'rate' => 250,
                        'discount_percent' => 0,
                        'tax_percent' => 0,
                    ],
                ],
            ], $user);

            $this->fail('Expected inventory validation exception was not thrown.');
        } catch (ValidationException $exception) {
            $this->assertStringContainsString('Insufficient stock', $exception->errors()['lines'][0] ?? '');
        }

        $item->refresh();
        $this->assertSame('2.000', (string) $item->current_stock);
    }
}
