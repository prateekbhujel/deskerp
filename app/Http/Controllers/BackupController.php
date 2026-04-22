<?php

namespace App\Http\Controllers;

use App\Services\BackupService;
use Illuminate\Http\BinaryFileResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BackupController extends Controller
{
    public function __construct(
        private readonly BackupService $backupService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Backups/Index', [
            'backups' => collect($this->backupService->listBackups())
                ->map(fn (array $backup): array => [
                    'name' => $backup['name'],
                    'size' => $backup['size'],
                    'modified_at' => $backup['modified_at'],
                ])
                ->values()
                ->all(),
        ]);
    }

    public function download(): BinaryFileResponse
    {
        $path = $this->backupService->createBackup();

        return response()->download($path, basename($path));
    }

    public function store(): BinaryFileResponse
    {
        return $this->download();
    }

    public function restore(Request $request): RedirectResponse
    {
        $request->validate([
            'backup_file' => ['required', 'file', 'mimetypes:application/octet-stream,application/x-sqlite3,application/vnd.sqlite3'],
            'confirmation_text' => ['required', 'in:RESTORE'],
        ]);

        $this->backupService->restore($request->file('backup_file'));

        return redirect()
            ->route('backups.index')
            ->with('success', 'Backup restored successfully. Reload the app if you had unsaved pages open.');
    }
}
