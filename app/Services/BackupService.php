<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;
use PDO;
use Throwable;

class BackupService
{
    public function listBackups(): array
    {
        $directory = storage_path('app/backups');

        if (! File::isDirectory($directory)) {
            return [];
        }

        return collect(File::files($directory))
            ->sortByDesc(fn ($file) => $file->getMTime())
            ->map(fn ($file) => [
                'name' => $file->getFilename(),
                'path' => $file->getRealPath(),
                'size' => $file->getSize(),
                'modified_at' => date('Y-m-d H:i:s', $file->getMTime()),
            ])
            ->values()
            ->all();
    }

    public function createBackup(): string
    {
        $directory = storage_path('app/backups');
        $source = database_path('database.sqlite');
        $filename = 'deskerp-backup-'.now()->format('Ymd-His').'.sqlite';
        $destination = $directory.DIRECTORY_SEPARATOR.$filename;

        File::ensureDirectoryExists($directory);
        File::copy($source, $destination);

        return $destination;
    }

    public function restore(UploadedFile $file): void
    {
        $this->assertValidSqliteBackup($file->getRealPath());

        DB::disconnect('sqlite');
        DB::purge('sqlite');

        File::copy($file->getRealPath(), database_path('database.sqlite'));

        DB::reconnect('sqlite');
    }

    private function assertValidSqliteBackup(string $path): void
    {
        try {
            $connection = new PDO('sqlite:'.$path);
            $tables = $connection->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'backup_file' => 'The uploaded file is not a valid SQLite backup.',
            ]);
        }

        if (! in_array('migrations', $tables, true) || ! in_array('users', $tables, true)) {
            throw ValidationException::withMessages([
                'backup_file' => 'The uploaded backup does not look like a DeskERP database.',
            ]);
        }
    }
}
