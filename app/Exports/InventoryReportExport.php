<?php

namespace App\Exports;

class InventoryReportExport extends AbstractArrayExport
{
    public function headings(): array
    {
        return ['SKU', 'Item', 'Category', 'Unit', 'Current Stock', 'Reorder Level', 'Base Price', 'Stock Value'];
    }
}
