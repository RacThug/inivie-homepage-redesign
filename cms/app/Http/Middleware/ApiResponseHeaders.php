<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * The two response headers docs/API-SPEC.md ch. 5.1 requires of the
 * public API. CORS, the third, is the framework's `HandleCors` reading
 * `config/cors.php`.
 *
 * Registered at the front of the `api` middleware group so it also sees
 * the responses rendered from exceptions thrown deeper in the stack: a
 * 422 from validation and a 429 from the rate limiter are API responses
 * too, and must not be indexable either.
 */
class ApiResponseHeaders
{
    private const MAX_AGE = 60;

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // S5. Matches production, where API responses are not indexed.
        $response->headers->set('X-Robots-Tag', 'noindex');

        if ($this->isCacheable($request, $response)) {
            $response->headers->set('Cache-Control', 'public, max-age='.self::MAX_AGE);
        }

        return $response;
    }

    /**
     * Only a successful read. A 422 or a 503 held in a shared cache for a
     * minute would outlive the condition that produced it and answer
     * somebody else's perfectly valid request.
     *
     * An endpoint that has already declared itself uncacheable keeps its
     * own answer, which is how /api/v1/health opts out.
     */
    private function isCacheable(Request $request, Response $response): bool
    {
        return $request->isMethodCacheable()
            && $response->isSuccessful()
            && ! $response->headers->hasCacheControlDirective('no-store');
    }
}
