<?php

namespace App\Exports;

class SalesReportExport extends AbstractArrayExport
{
    public function headings(): array
    {
        return ['Date', 'Invoice', 'Customer', 'Subtotal', 'Discount', 'Tax', 'Total', 'Paid', 'Balance'];
    }
}
