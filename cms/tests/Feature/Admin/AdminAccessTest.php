<?php

use App\Models\User;
use Illuminate\Routing\Route as RouteDefinition;
use Illuminate\Support\Facades\Route;

/*
| Requirement S1: the admin panel is unreachable without authentication.
|
| Asserted against the route table rather than by probing the one URL that
| exists today. Probing proves that `/admin` is locked; walking the table
| proves that every admin route is, including the one somebody adds next
| month and forgets to put inside the group.
|
| The same shape as the read only guarantee in PublicApiContractTest, and for
| the same reason.
*/

/**
 * @return list<RouteDefinition>
 */
function adminRoutes(): array
{
    return array_values(array_filter(
        Route::getRoutes()->getRoutes(),
        fn (RouteDefinition $route) => str_starts_with($route->uri(), 'admin')
            // The way in cannot require being in already.
            && $route->uri() !== 'admin/login',
    ));
}

it('puts every admin route behind the auth middleware', function () {
    $unguarded = array_map(
        fn (RouteDefinition $route) => $route->methods()[0].' /'.$route->uri(),
        array_filter(
            adminRoutes(),
            fn (RouteDefinition $route) => ! in_array('auth', $route->gatherMiddleware(), true),
        ),
    );

    expect($unguarded)->toBeEmpty();
});

it('has admin routes to guard in the first place', function () {
    // Without this, the assertion above passes vacuously the day someone
    // renames the prefix.
    expect(adminRoutes())->not->toBeEmpty();
});

it('sends a signed out visitor to the login screen', function (string $uri) {
    $this->get($uri)->assertRedirect(route('login'));
})->with([
    'the dashboard' => '/admin',
]);

it('lets a signed in admin reach the dashboard', function () {
    $this->actingAs(User::factory()->create())
        ->get('/admin')
        ->assertOk();
});

it('points the site root at the panel', function () {
    // The CMS has no public web surface, so a reviewer opening
    // localhost:8000 should arrive somewhere real. Acceptance criterion A5.
    $this->get('/')->assertRedirect('/admin');
});
