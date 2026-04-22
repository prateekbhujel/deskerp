<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('username')->nullable()->unique()->after('name');
        });

        $existing = DB::table('users')->select('id', 'name', 'email')->get();

        foreach ($existing as $user) {
            $base = Str::of((string) ($user->name ?: $user->email ?: "user{$user->id}"))
                ->lower()
                ->replaceMatches('/[^a-z0-9]+/', '.')
                ->trim('.')
                ->value();

            if ($base === '') {
                $base = "user{$user->id}";
            }

            $candidate = $base;
            $suffix = 1;

            while (DB::table('users')->where('username', $candidate)->where('id', '!=', $user->id)->exists()) {
                $candidate = "{$base}.{$suffix}";
                $suffix++;
            }

            DB::table('users')
                ->where('id', $user->id)
                ->update(['username' => $candidate]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['username']);
            $table->dropColumn('username');
        });
    }
};
