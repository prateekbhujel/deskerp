<?php

namespace Tests\Feature\DeskPro;

use App\Models\Item;
use App\Models\Unit;
use App\Services\PricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingBehaviorTest extends TestCase
{
    use RefreshDatabase;

    public function test_named_price_tier_overrides_default_selling_price(): void
    {
        $unit = Unit::query()->create(['name' => 'Piece', 'code' => 'PCS', 'is_active' => true]);
        $item = Item::query()->create([
            'unit_id' => $unit->id,
            'name' => 'Mouse',
            'item_type' => 'stockable',
            'selling_price' => 25,
            'base_price' => 18,
            'tax_rate' => 0,
            'allow_discount' => true,
            'track_inventory' => true,
            'is_active' => true,
        ]);

        $pricing = app(PricingService::class);
        $pricing->syncPriceTiers($item, [
            ['label' => 'Wholesale', 'amount' => 20],
            ['label' => 'Retail Plus', 'amount' => 28],
        ]);

        $item->refresh()->load('prices');

        $this->assertSame('20.00', $pricing->resolveSellingPrice($item, 'Wholesale'));
        $this->assertSame('25.00', $pricing->resolveSellingPrice($item, 'Missing Tier'));
    }
}
