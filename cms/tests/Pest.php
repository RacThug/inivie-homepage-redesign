<?php

use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\FakeImage;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| Every test in this suite exercises the Laravel application, so both
| directories get the framework TestCase and a migrated database. The
| split is by what a test covers, not by whether it may touch the
| database: Unit holds domain rules in isolation, Feature holds the
| behaviour a client can observe.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature', 'Unit');

/*
|--------------------------------------------------------------------------
| Vite
|--------------------------------------------------------------------------
|
| `@vite` throws when public/build/manifest.json is missing, which would make
| the PHP suite fail on a machine that has not run `npm run build`. Stubbing
| it keeps the two toolchains independent: this suite tests the application,
| not the asset pipeline.
|
| The cost is that the suite cannot catch a missing build, which is exactly
| the silent failure docs/TECHNICAL-DESIGN.md ch. 2.4 records. That is why the
| build step is written down there rather than left to be discovered.
|
*/

pest()->beforeEach(fn () => $this->withoutVite())->in('Feature');

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
|
| A complete, valid property submission, shared by the CRUD and validation
| suites. Cases override the one field they are about, so what a test is
| testing is visible in its own body rather than assembled from twelve lines
| of scaffolding above it.
|
*/

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function propertyForm(array $overrides = []): array
{
    return array_merge([
        'title' => 'Leedon Villa Seminyak',
        'slug' => 'leedon-villa-seminyak',
        'category' => 'villa',
        'location' => 'Seminyak, Bali',
        'excerpt' => 'A three bedroom villa a short walk from the beach.',
        'image' => FakeImage::png('villa.png', 1200, 900),
        'image_alt' => 'The pool terrace at dusk.',
        'image_focus' => 'center',
        'price_from' => 4500000,
        'rating' => 4.8,
        'cta_url' => 'https://inivie.com/properties/leedon-villa-seminyak',
        'sort_order' => 3,
        'is_published' => '1',
    ], $overrides);
}

/**
 * A property whose image really exists on the faked disk, created the way an
 * admin creates one, so a cleanup assertion is about a file rather than about
 * a string. The caller is expected to have faked the disk already.
 */
function propertyWithRealImage(): Property
{
    test()->post(route('admin.properties.store'), propertyForm());

    return Property::sole();
}
