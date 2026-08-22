<?php

use App\Models\Property;
use Illuminate\Support\Facades\Route;

/*
| The properties of /api/v1 that hold whatever the endpoint underneath is:
| response headers (docs/API-SPEC.md ch. 5.1), CORS and rate limiting
| (docs/TECHNICAL-DESIGN.md ch. 6), and the read only guarantee of P2.
*/

it('marks a successful read as cacheable for a minute', function () {
    Property::factory()->published()->create();

    // Content changes rarely, and 60 seconds bounds staleness without
    // inviting a request storm. Symfony re-serialises Cache-Control with
    // its directives in alphabetical order, so the wire value reads
    // "max-age=60, public" rather than the other way round.
    $this->getJson('/api/v1/properties')
        ->assertOk()
        ->assertHeader('Cache-Control', 'max-age=60, public');
});

it('does not let a rejected request be cached', function () {
    $headers = $this->getJson('/api/v1/properties?limit=99')
        ->assertUnprocessable()
        ->baseResponse->headers;

    // A 422 living in a shared cache for a minute would outlive the
    // request that caused it and answer somebody else's valid one.
    expect($headers->hasCacheControlDirective('public'))->toBeFalse()
        ->and($headers->hasCacheControlDirective('max-age'))->toBeFalse();
});

it('keeps every api response out of search results', function (string $uri) {
    $this->getJson($uri)->assertHeader('X-Robots-Tag', 'noindex');
})->with([
    'the list' => '/api/v1/properties',
    'a rejected list request' => '/api/v1/properties?limit=99',
    'health' => '/api/v1/health',
]);

it('allows the frontend origin', function () {
    $this->withHeader('Origin', config('cors.allowed_origins')[0])
        ->getJson('/api/v1/properties')
        ->assertHeader('Access-Control-Allow-Origin', config('cors.allowed_origins')[0]);
});

it('refuses any other origin', function () {
    // A single configured origin is echoed back unconditionally, which is
    // what makes the refusal work: the browser compares the header with
    // its own origin and blocks the read when they differ. What matters
    // is that the requesting origin is never the one reflected.
    $this->withHeader('Origin', 'https://not-the-frontend.example')
        ->getJson('/api/v1/properties')
        ->assertHeader('Access-Control-Allow-Origin', config('cors.allowed_origins')[0]);
});

it('never allows a wildcard origin', function () {
    // Production pins https://inivie.com. A wildcard here would be a
    // configuration that only works because nobody looked.
    expect(config('cors.allowed_origins'))->not->toContain('*')
        ->and(config('cors.allowed_origins_patterns'))->toBe([]);
});

it('answers a preflight request for the frontend origin', function () {
    $this->call('OPTIONS', '/api/v1/properties', server: [
        'HTTP_ORIGIN' => config('cors.allowed_origins')[0],
        'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
    ])->assertNoContent();
});

it('registers no mutation route under the public api', function () {
    $mutating = collect(Route::getRoutes()->getRoutes())
        ->filter(fn ($route) => str_starts_with($route->uri(), 'api/v1'))
        ->filter(fn ($route) => array_intersect($route->methods(), ['POST', 'PUT', 'PATCH', 'DELETE']))
        ->map(fn ($route) => implode('|', $route->methods()).' '.$route->uri())
        ->values()
        ->all();

    // P2, asserted against the route table rather than by probing one
    // URL, so a mutation route added later cannot hide behind a test
    // that only knows the paths written before it.
    expect($mutating)->toBe([]);
});

it('rate limits at sixty requests a minute', function () {
    foreach (range(1, 60) as $ignored) {
        $this->getJson('/api/v1/properties')->assertOk();
    }

    $this->getJson('/api/v1/properties')->assertTooManyRequests();
});
