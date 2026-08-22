<?php

/*
|--------------------------------------------------------------------------
| Cross-Origin Resource Sharing (CORS) Configuration
|--------------------------------------------------------------------------
|
| Published from the framework defaults and narrowed, because those
| defaults allow every origin and every method. See requirement S2 in
| docs/PRD.md ch. 8.5 and docs/TECHNICAL-DESIGN.md ch. 6.
|
*/

return [

    // Only the public API is cross-origin. The admin panel is same-origin
    // session authenticated, and Sanctum is not installed, so the
    // framework default's `sanctum/csrf-cookie` path is dropped.
    'paths' => ['api/*'],

    // The public API is read only (P2). Allowing the write verbs would
    // advertise a capability that does not exist.
    'allowed_methods' => ['GET', 'HEAD', 'OPTIONS'],

    // One origin, from the environment, never a wildcard. Production
    // sends `Access-Control-Allow-Origin: https://inivie.com`, and this
    // mirrors it rather than being permissive in development only.
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // No cookie or Authorization header crosses this boundary. The
    // endpoint is anonymous.
    'supports_credentials' => false,

];
