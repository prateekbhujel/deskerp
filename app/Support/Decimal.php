<?php

namespace App\Support;

use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;

class Decimal
{
    public static function normalize(mixed $value, int $scale = 2): string
    {
        return self::value($value)->toScale($scale, RoundingMode::HALF_UP)->__toString();
    }

    public static function add(array $values, int $scale = 2): string
    {
        $total = BigDecimal::zero();

        foreach ($values as $value) {
            $total = $total->plus(self::value($value));
        }

        return $total->toScale($scale, RoundingMode::HALF_UP)->__toString();
    }

    public static function subtract(mixed $left, mixed $right, int $scale = 2): string
    {
        return self::value($left)
            ->minus(self::value($right))
            ->toScale($scale, RoundingMode::HALF_UP)
            ->__toString();
    }

    public static function multiply(mixed $left, mixed $right, int $scale = 2): string
    {
        return self::value($left)
            ->multipliedBy(self::value($right))
            ->toScale($scale, RoundingMode::HALF_UP)
            ->__toString();
    }

    public static function percentageOf(mixed $base, mixed $percentage, int $scale = 2): string
    {
        return self::value($base)
            ->multipliedBy(self::value($percentage))
            ->dividedBy('100', $scale, RoundingMode::HALF_UP)
            ->__toString();
    }

    public static function compare(mixed $left, mixed $right): int
    {
        return self::value($left)->compareTo(self::value($right));
    }

    private static function value(mixed $value): BigDecimal
    {
        if ($value === null || $value === '') {
            return BigDecimal::zero();
        }

        return BigDecimal::of(str_replace(',', '', (string) $value));
    }
}
