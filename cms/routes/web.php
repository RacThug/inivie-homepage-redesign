<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PropertyController;
use App\Http\Controllers\Admin\PublishPropertyController;
use App\Http\Controllers\Admin\ReorderPropertiesController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

/*
| The admin panel, documented in docs/TECHNICAL-DESIGN.md ch. 5.2.
|
| The CMS has no public web surface: everything a browser can reach here is
| either the panel or the way into it. `/` therefore redirects rather than
| serving a landing page, so a reviewer who opens localhost:8000 arrives
| somewhere real.
|
| Requirement C1 and S1 are the shape of this file. Every admin route sits
| inside the `auth` group, and a feature test asserts that by walking the
| route table rather than by probing one URL, so a route added later without
| the middleware fails the suite instead of shipping.
*/

Route::redirect('/', '/admin');

Route::prefix('admin')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [LoginController::class, 'create'])->name('login');
        Route::post('login', [LoginController::class, 'store']);
    });

    Route::middleware('auth')->name('admin.')->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');
        Route::post('logout', [LoginController::class, 'destroy'])->name('logout');

        // The two row level actions of C6 and C7. Separate verbs on
        // separate URIs, so they sit outside the resource rather than
        // inside it, and each is a single action controller because
        // neither renders a screen: both answer with a redirect back to
        // the row the admin was looking at.
        //
        // Declared above the resource so the pair reads as the exceptions
        // they are, rather than being found underneath a one line
        // `Route::resource` on the way past.
        Route::patch('properties/{property}/publish', PublishPropertyController::class)
            ->name('properties.publish');

        Route::post('properties/reorder', ReorderPropertiesController::class)
            ->name('properties.reorder');

        // The six routes of ch. 5.2, declared as a resource rather than one
        // by one. `show` is excluded because the CMS has no read only view
        // of a property: the edit form is where an admin looks at one, and a
        // detail screen nobody links to is a screen that rots.
        Route::resource('properties', PropertyController::class)->except('show');
    });
});
