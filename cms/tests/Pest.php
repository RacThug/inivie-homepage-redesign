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
