<?php

use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\PropertyController;
use Illuminate\Support\Facades\Route;

/*
| The public read API consumed by the Next.js frontend, documented in
| docs/API-SPEC.md.
|
| P1: the version lives in the path, so a breaking change ships as
| /api/v2 instead of breaking a deployed frontend.
|
| P2: every route here is a GET. A mutation belongs to the session
| authenticated admin panel in routes/web.php, and a feature test asserts
| that nothing under api/v1 answers a write verb.
*/

Route::prefix('v1')->group(function () {
    Route::get('properties', PropertyController::class)->name('api.v1.properties.index');
    Route::get('health', HealthController::class)->name('api.v1.health');
});
