<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = [
        'item_id',
        'movement_date',
        'movement_type',
        'quantity_change',
        'reference_type',
        'reference_id',
        'reference_number',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'movement_date' => 'date',
            'quantity_change' => 'decimal:3',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
