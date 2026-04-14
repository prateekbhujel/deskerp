<?php

namespace App\Http\Controllers;

use App\Services\BackupService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BackupController extends Controller
{
    public function __construct(
        private readonly BackupService $backupService,
    ) {}

    public function index(): View
    {
        return view('backups.index', [
            'backups' => $this->backupService->listBackups(),
        ]);
    }

    public function store()
    {
        $path = $this->backupService->createBackup();

        return response()->download($path, basename($path));
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
