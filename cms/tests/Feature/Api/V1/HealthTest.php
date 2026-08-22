<?php

use Illuminate\Support\Facades\DB;

/*
| docs/API-SPEC.md ch. 4. This endpoint exists so a reviewer looking at a
| blank Featured Properties section can tell in one request whether the
| CMS is down, the database is down, or neither.
*/

it('reports a healthy application', function () {
    $this->getJson('/api/v1/health')
        ->assertOk()
        ->assertExactJson([
            'status' => 'ok',
            'database' => 'connected',
        ]);
});

it('reports an unreachable database with 503', function () {
    // Repointing the default connection at a broken one would be more
    // faithful, but RefreshDatabase rolls back whatever the default is at
    // teardown and would leave the shared in-memory connection inside an
    // open transaction for every test after this one.
    DB::shouldReceive('selectOne')
        ->once()
        ->andThrow(new PDOException('SQLSTATE[HY000] [2002] Connection refused'));

    $this->getJson('/api/v1/health')
        ->assertServiceUnavailable()
        ->assertExactJson([
            'status' => 'error',
            'database' => 'unreachable',
        ]);
});

it('is never cached', function () {
    // A health check answered from a minute old cache reports the past,
    // which is worse than not answering at all.
    $headers = $this->getJson('/api/v1/health')->baseResponse->headers;

    expect($headers->hasCacheControlDirective('no-store'))->toBeTrue()
        ->and($headers->hasCacheControlDirective('max-age'))->toBeFalse();
});
