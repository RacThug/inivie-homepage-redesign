<?php

use App\Models\Property;
use Illuminate\Support\Carbon;

/*
| Domain rule D6. See docs/DATA-MODEL.md ch. 3 and ch. 3.1.
*/

it('leaves published_at null while a property is a draft', function () {
    $property = Property::factory()->draft()->create();

    expect($property->published_at)->toBeNull();
});

it('sets published_at when a property is created already published', function () {
    $property = Property::factory()->published()->create();

    expect($property->published_at)->not->toBeNull();
});

it('sets published_at when is_published transitions from false to true', function () {
    $property = Property::factory()->draft()->create();

    Carbon::setTestNow('2026-08-22 10:00:00');
    $property->update(['is_published' => true]);

    expect($property->fresh()->published_at->toDateTimeString())
        ->toBe('2026-08-22 10:00:00');
});

it('does not reset published_at when a property is unpublished', function () {
    $property = Property::factory()->draft()->create();

    Carbon::setTestNow('2026-08-22 10:00:00');
    $property->update(['is_published' => true]);

    Carbon::setTestNow('2026-08-23 10:00:00');
    $property->update(['is_published' => false]);

    expect($property->fresh()->published_at->toDateTimeString())
        ->toBe('2026-08-22 10:00:00');
});

it('keeps the first published_at when a property is republished', function () {
    $property = Property::factory()->draft()->create();

    Carbon::setTestNow('2026-08-22 10:00:00');
    $property->update(['is_published' => true]);

    Carbon::setTestNow('2026-08-23 10:00:00');
    $property->update(['is_published' => false]);

    Carbon::setTestNow('2026-08-24 10:00:00');
    $property->update(['is_published' => true]);

    expect($property->fresh()->published_at->toDateTimeString())
        ->toBe('2026-08-22 10:00:00');
});

it('does not touch published_at when an unrelated column changes', function () {
    Carbon::setTestNow('2026-08-22 10:00:00');
    $property = Property::factory()->published()->create();

    Carbon::setTestNow('2026-08-23 10:00:00');
    $property->update(['title' => 'A new title']);

    expect($property->fresh()->published_at->toDateTimeString())
        ->toBe('2026-08-22 10:00:00');
});

it('does not re-stamp a live row whose published_at was cleared', function () {
    Carbon::setTestNow('2026-08-22 10:00:00');
    $property = Property::factory()->published()->create();

    Carbon::setTestNow('2026-08-23 10:00:00');
    $property->update(['published_at' => null]);

    // is_published never moved, so D6 never fires. Rewriting the stamp
    // here would replace the historical fact with today's date.
    expect($property->fresh()->published_at)->toBeNull();
});

it('stamps a row created published without a stamp of its own', function () {
    // The published() factory state supplies published_at, so the tests
    // above would survive the observer being deleted. This one would not.
    Carbon::setTestNow('2026-08-22 10:00:00');

    $property = Property::factory()->create([
        'is_published' => true,
        'published_at' => null,
    ]);

    expect($property->published_at?->toDateTimeString())->toBe('2026-08-22 10:00:00');
});
