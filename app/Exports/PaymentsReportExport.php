<?php

namespace App\Exports;

class PaymentsReportExport extends AbstractArrayExport
{
    public function headings(): array
    {
        return ['Date', 'Number', 'Direction', 'Party', 'Invoice', 'Method', 'Reference', 'Amount'];
    }
}
