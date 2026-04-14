<?php

namespace App\Services;

use App\Models\AppSetting;
use Illuminate\Support\Collection;

class SettingsService
{
    public function all(): Collection
    {
        return AppSetting::query()->pluck('value', 'key');
    }

    public function get(string $key, ?string $default = null): ?string
    {
        return AppSetting::query()->where('key', $key)->value('value') ?? $default;
    }

    public function set(string $key, ?string $value): void
    {
        AppSetting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
