<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * `GET /api/v1/health`, documented in docs/API-SPEC.md ch. 4.
 *
 * This exists for one situation: a reviewer sees an empty Featured
 * Properties section and needs to know, in a single request, whether the
 * CMS is down, its database is down, or neither and the section is
 * simply empty.
 */
class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $connected = $this->databaseIsReachable();

        return response()
            ->json([
                'status' => $connected ? 'ok' : 'error',
                'database' => $connected ? 'connected' : 'unreachable',
            ], $connected ? 200 : 503)
            // A health check served from a minute old cache reports the
            // past. The Cache-Control of ch. 5.1 is for the read
            // endpoints; ApiResponseHeaders leaves this one alone.
            ->header('Cache-Control', 'no-store');
    }

    /**
     * A round trip, not `getPdo()`. An already resolved connection hands
     * back its cached PDO without touching the server, so a database
     * that died after the first query would still look reachable.
     */
    private function databaseIsReachable(): bool
    {
        try {
            DB::selectOne('select 1');

            return true;
        } catch (Throwable $e) {
            report($e);

            return false;
        }
    }
}
