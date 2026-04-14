<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'unit_id' => ['required', 'exists:units,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('items', 'sku')],
            'name' => ['required', 'string', 'max:255'],
            'item_type' => ['required', 'in:stockable,service'],
            'description' => ['nullable', 'string'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'allow_discount' => ['nullable', 'boolean'],
            'track_inventory' => ['nullable', 'boolean'],
            'opening_stock' => ['nullable', 'numeric', 'min:0'],
            'reorder_level' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'price_tiers' => ['nullable', 'array'],
            'price_tiers.*.label' => ['nullable', 'string', 'max:100'],
            'price_tiers.*.amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
