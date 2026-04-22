<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictViewOnlyAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== 'view_only') {
            return $next($request);
        }

        if (! in_array($request->method(), ['GET', 'HEAD'], true)) {
            abort(403, 'View only users cannot change data.');
        }

        $routeName = (string) optional($request->route())->getName();

        if ($routeName !== '' && (
            str_ends_with($routeName, '.create')
            || str_ends_with($routeName, '.edit')
            || str_starts_with($routeName, 'settings.')
            || str_starts_with($routeName, 'backups.')
            || str_starts_with($routeName, 'profile.')
        )) {
            abort(403, 'View only users can access reports and read-only registers.');
        }

        return $next($request);
    }
}
