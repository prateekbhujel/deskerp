<?php

namespace App\Services;

use App\Models\AppSetting;
use Illuminate\Support\Facades\DB;

class SequenceService
{
    public function nextInvoiceNumber(): string
    {
        return $this->nextFormattedNumber('invoice');
    }

    public function nextPaymentNumber(string $direction): string
    {
        return $this->nextFormattedNumber($direction === 'made' ? 'payment_made' : 'payment_received');
    }

    private function nextFormattedNumber(string $series): string
    {
        return DB::transaction(function () use ($series): string {
            $prefixSetting = AppSetting::query()->firstOrCreate(
                ['key' => "{$series}_prefix"],
                ['value' => strtoupper(substr($series, 0, 3))],
            );

            $counterSetting = AppSetting::query()->firstOrCreate(
                ['key' => "{$series}_next_number"],
                ['value' => '1'],
            );

            $number = (int) $counterSetting->value;

            $counterSetting->update([
                'value' => (string) ($number + 1),
            ]);

            return sprintf('%s-%05d', strtoupper($prefixSetting->value ?? 'DOC'), $number);
        });
    }
}
