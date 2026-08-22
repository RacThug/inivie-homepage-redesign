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

        // Where the `guest` middleware sends someone who is already signed
        // in. The default is `/`, which works only because `/` redirects to
        // the panel, so leaving it would spend two redirects arriving where
        // one gets there. Guests are already sent to the `login` route by
        // name, so that direction needs no configuration.
        $middleware->redirectUsersTo('/admin');

        // The sidebar collapse state of docs/DESIGN-SYSTEM.md ch. 8.3.
        //
        // It has to be readable by both sides: the browser writes it on
        // click, and Blade reads it while rendering so the next page paints
        // at the right width. Laravel encrypts cookies by default, so a
        // value written in JavaScript would fail to decrypt and arrive as
        // null on every request, leaving the sidebar permanently expanded.
        // Excluding it is safe because it carries no secret, only a width.
        $middleware->encryptCookies(except: ['admin_sidebar']);

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
