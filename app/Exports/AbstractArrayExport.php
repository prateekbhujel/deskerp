<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

abstract class AbstractArrayExport implements FromArray, ShouldAutoSize, WithHeadings
{
    public function __construct(
        protected readonly Collection $rows,
    ) {}

    public function array(): array
    {
        return $this->rows->all();
    }
}
