<?php

namespace App\Services;

use App\Models\Item;

class PricingService
{
    public function resolveSellingPrice(Item $item, ?string $label = null): string
    {
        if ($label) {
            $tier = $item->prices->firstWhere('label', $label);

            if ($tier) {
                return (string) $tier->amount;
            }
        }

        return (string) $item->selling_price;
    }

    public function syncPriceTiers(Item $item, array $tiers): void
    {
        $filtered = collect($tiers)
            ->map(function (array $tier, int $index): array {
                return [
                    'label' => trim((string) ($tier['label'] ?? '')),
                    'amount' => $tier['amount'] ?? 0,
                    'position' => $index,
                ];
            })
            ->filter(fn (array $tier): bool => $tier['label'] !== '')
            ->values();

        $item->prices()->delete();

        foreach ($filtered as $index => $tier) {
            $item->prices()->create([
                'label' => $tier['label'],
                'amount' => $tier['amount'],
                'position' => $index,
                'is_default' => false,
            ]);
        }
    }
}
