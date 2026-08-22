<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * The `api` limiter referenced by `throttleApi()` in bootstrap/app.php.
     *
     * 60 a minute per IP, from docs/TECHNICAL-DESIGN.md ch. 6. The
     * frontend fetches server side once per 60 second cache window, so
     * this only ever bites a scraper.
     *
     * Laravel 11 stopped shipping a default definition for this name, and
     * an undefined named limiter degrades to zero permitted requests
     * rather than to no limit, so the endpoint would 429 on the first
     * call. Defining it here is not optional.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(60)->by($request->ip()));
    }
}
