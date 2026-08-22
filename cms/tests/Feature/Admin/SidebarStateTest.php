<?php

use App\Models\User;

/*
| The sidebar collapse of docs/DESIGN-SYSTEM.md ch. 8.3.
|
| The rail has two drivers that must agree: Blade renders it from the cookie on
| first paint, and the browser applies it on click without a round trip. The
| failure mode is silent and one directional. Anything the server decides in
| PHP looks correct on load and is then stale for the rest of the session,
| because the browser only flips an attribute.
|
| That is not hypothetical: the brand mark was first rendered as a PHP ternary,
| so collapsing in the browser left the full wordmark inside a 64px column.
*/

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

/**
 * The page with everything that legitimately differs between the two states
 * flattened away: the collapse state itself, and the per request tokens.
 */
function normalisedShell(string $html): string
{
    return preg_replace(
        [
            '/data-rail="(true|false)"/',
            '/aria-expanded="(true|false)"/',
            '/title="(Expand|Collapse)"/',
            '/aria-label="(Expand|Collapse) sidebar"/',
            '/(name="_token" value|name="csrf-token" content)="[^"]*"/',
        ],
        ['data-rail', 'aria-expanded', 'title', 'aria-label', '$1'],
        $html,
    );
}

it('renders the same markup collapsed as expanded, apart from the state itself', function () {
    $expanded = $this->get('/admin')->getContent();
    $rail = $this->withUnencryptedCookie('admin_sidebar', 'rail')->get('/admin')->getContent();

    // Every difference between the two must be expressible in CSS, or the
    // browser cannot produce the collapsed state on its own.
    expect(normalisedShell($rail))->toBe(normalisedShell($expanded));
});

it('puts the rail in the first paint when the cookie asks for it', function () {
    // The reason the state is a cookie rather than localStorage: a Blade admin
    // is full page loads, so a correction applied after the document arrived
    // would flash on every navigation.
    $this->withUnencryptedCookie('admin_sidebar', 'rail')
        ->get('/admin')
        ->assertSee('data-rail="true"', escape: false);
});

it('defaults to expanded when no cookie has been set', function () {
    $this->get('/admin')->assertSee('data-rail="false"', escape: false);
});

it('keeps the wordmark in the markup so css alone can hide it', function () {
    // A brand rendered as `$rail ? 'iV' : 'iNi ViE'` passes every assertion
    // above on load and is wrong the moment the admin clicks collapse.
    $this->withUnencryptedCookie('admin_sidebar', 'rail')
        ->get('/admin')
        ->assertSee('iNi ViE');
});
