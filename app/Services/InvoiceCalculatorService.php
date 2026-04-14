<?php

namespace App\Services;

use App\Models\Item;
use App\Support\Decimal;
use Illuminate\Validation\ValidationException;

class InvoiceCalculatorService
{
    public function __construct(
        private readonly PricingService $pricingService,
    ) {}

    public function calculate(array $lines): array
    {
        $itemLookup = Item::query()
            ->with('unit', 'prices')
            ->whereIn('id', collect($lines)->pluck('item_id')->filter()->all())
            ->get()
            ->keyBy('id');

        $normalizedLines = collect($lines)
            ->filter(fn (array $line): bool => trim((string) ($line['description'] ?? '')) !== '' || ! empty($line['item_id']))
            ->values()
            ->map(function (array $line, int $index) use ($itemLookup): array {
                $item = $line['item_id'] ? $itemLookup->get((int) $line['item_id']) : null;
                $description = trim((string) ($line['description'] ?? ($item?->name ?? '')));

                if ($description === '') {
                    throw ValidationException::withMessages([
                        "lines.$index.description" => 'Line description is required.',
                    ]);
                }

                $quantity = Decimal::normalize($line['quantity'] ?? 0, 3);
                $rate = Decimal::normalize(
                    $line['rate'] ?? ($item ? $this->pricingService->resolveSellingPrice($item) : 0),
                    2,
                );
                $taxPercent = Decimal::normalize($line['tax_percent'] ?? ($item?->tax_rate ?? 0), 2);
                $discountPercent = Decimal::normalize($line['discount_percent'] ?? 0, 2);
                $subtotal = Decimal::multiply($quantity, $rate, 2);
                $discountAmount = Decimal::percentageOf($subtotal, $discountPercent, 2);
                $taxableSubtotal = Decimal::subtract($subtotal, $discountAmount, 2);
                $taxTotal = Decimal::percentageOf($taxableSubtotal, $taxPercent, 2);
                $total = Decimal::add([$taxableSubtotal, $taxTotal], 2);

                if (Decimal::compare($quantity, 0) <= 0) {
                    throw ValidationException::withMessages([
                        "lines.$index.quantity" => 'Quantity must be greater than zero.',
                    ]);
                }

                return [
                    'item_id' => $item?->id,
                    'description' => $description,
                    'unit_name' => $line['unit_name'] ?? $item?->unit?->code,
                    'quantity' => $quantity,
                    'rate' => $rate,
                    'base_price' => $item?->base_price ?? $rate,
                    'discount_percent' => $discountPercent,
                    'discount_amount' => $discountAmount,
                    'tax_percent' => $taxPercent,
                    'subtotal' => $subtotal,
                    'tax_total' => $taxTotal,
                    'total' => $total,
                    'sort_order' => $index,
                ];
            })
            ->all();

        if ($normalizedLines === []) {
            throw ValidationException::withMessages([
                'lines' => 'At least one invoice line is required.',
            ]);
        }

        $subtotal = Decimal::add(array_column($normalizedLines, 'subtotal'));
        $discountTotal = Decimal::add(array_column($normalizedLines, 'discount_amount'));
        $taxTotal = Decimal::add(array_column($normalizedLines, 'tax_total'));
        $total = Decimal::add(array_column($normalizedLines, 'total'));

        return [
            'lines' => $normalizedLines,
            'subtotal' => $subtotal,
            'discount_total' => $discountTotal,
            'tax_total' => $taxTotal,
            'total' => $total,
        ];
    }
}
