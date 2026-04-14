<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Item;
use App\Models\StockMovement;
use App\Support\Decimal;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function syncOpeningStock(Item $item, mixed $quantity): void
    {
        if (! $item->track_inventory) {
            $item->stockMovements()
                ->where('movement_type', 'opening')
                ->where('reference_type', 'item')
                ->where('reference_id', $item->id)
                ->delete();

            $item->update(['current_stock' => 0]);

            return;
        }

        $normalizedQuantity = Decimal::normalize($quantity, 3);

        if (Decimal::compare($normalizedQuantity, 0) === 0) {
            $item->stockMovements()
                ->where('movement_type', 'opening')
                ->where('reference_type', 'item')
                ->where('reference_id', $item->id)
                ->delete();
        } else {
            StockMovement::query()->updateOrCreate(
                [
                    'item_id' => $item->id,
                    'movement_type' => 'opening',
                    'reference_type' => 'item',
                    'reference_id' => $item->id,
                ],
                [
                    'movement_date' => now()->toDateString(),
                    'quantity_change' => $normalizedQuantity,
                    'reference_number' => 'OPEN-'.$item->id,
                    'notes' => 'Opening stock',
                ],
            );
        }

        $this->recalculateItems([$item->id]);
    }

    public function syncInvoiceStock(Invoice $invoice): void
    {
        $invoice->loadMissing('lines.item');

        $movementItemIds = StockMovement::query()
            ->where('reference_type', 'invoice')
            ->where('reference_id', $invoice->id)
            ->pluck('item_id')
            ->all();

        $lineItemIds = $invoice->lines
            ->filter(fn ($line) => $line->item && $line->item->track_inventory)
            ->pluck('item_id')
            ->all();

        StockMovement::query()
            ->where('reference_type', 'invoice')
            ->where('reference_id', $invoice->id)
            ->delete();

        if ($invoice->status === 'final') {
            foreach ($invoice->lines as $line) {
                if (! $line->item || ! $line->item->track_inventory) {
                    continue;
                }

                StockMovement::query()->create([
                    'item_id' => $line->item_id,
                    'movement_date' => $invoice->issue_date,
                    'movement_type' => 'sale',
                    'quantity_change' => Decimal::subtract(0, $line->quantity, 3),
                    'reference_type' => 'invoice',
                    'reference_id' => $invoice->id,
                    'reference_number' => $invoice->invoice_number,
                    'notes' => 'Sales invoice issue',
                ]);
            }
        }

        $this->recalculateItems(array_unique([...$movementItemIds, ...$lineItemIds]));
    }

    public function recalculateItems(array $itemIds): void
    {
        $itemIds = array_filter(array_unique($itemIds));

        if ($itemIds === []) {
            return;
        }

        $totals = StockMovement::query()
            ->select('item_id', DB::raw('COALESCE(SUM(quantity_change), 0) as total_quantity'))
            ->whereIn('item_id', $itemIds)
            ->groupBy('item_id')
            ->pluck('total_quantity', 'item_id');

        foreach ($itemIds as $itemId) {
            Item::query()->whereKey($itemId)->update([
                'current_stock' => Decimal::normalize($totals[$itemId] ?? 0, 3),
            ]);
        }
    }
}
