<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
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
