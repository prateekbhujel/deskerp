<?php

namespace App\Exports;

class SupplierLedgerExport extends AbstractArrayExport
{
    public function headings(): array
    {
        return ['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance', 'Notes'];
    }
}
