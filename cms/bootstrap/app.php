<?php

use App\Http\Middleware\ApiResponseHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Prepended, so it wraps the rate limiter and sees the responses
        // rendered from exceptions thrown further in. See the class
        // docblock.
        $middleware->api(prepend: [ApiResponseHeaders::class]);

        // Laravel 11 dropped the default throttle on the api group.
        // Requirement S2 wants one, and the limit itself is defined as
        // the `api` rate limiter in AppServiceProvider.
        $middleware->throttleApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
