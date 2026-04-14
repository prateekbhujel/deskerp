<?php

namespace App\Support;

use Symfony\Component\HttpFoundation\StreamedResponse;

class CsvExport
{
    public static function download(string $filename, array $headers, iterable $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($headers, $rows): void {
            $stream = fopen('php://output', 'w');

            fputcsv($stream, $headers);

            foreach ($rows as $row) {
                $normalized = array_map(
                    fn (mixed $value): mixed => is_bool($value) ? ($value ? 'Yes' : 'No') : $value,
                    $row,
                );

                fputcsv($stream, $normalized);
            }

            fclose($stream);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
