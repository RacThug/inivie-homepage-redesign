<?php

use App\Enums\PropertyCategory;
use App\Models\Property;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/*
| Domain rules D4 and the soft delete half of D5, both enforced by the
| schema rather than by application code. See docs/DATA-MODEL.md ch. 2.2
| and ch. 3. Image cleanup, the other half of D5, belongs to
| PropertyImageStore and is not in this ticket.
*/

it('rejects a duplicate slug', function () {
    Property::factory()->create(['slug' => 'leedon-villa-seminyak']);

    Property::factory()->create(['slug' => 'leedon-villa-seminyak']);
})->throws(QueryException::class);

it('rejects a slug that collides with a soft deleted row', function () {
    Property::factory()->create(['slug' => 'leedon-villa-seminyak'])->delete();

    Property::factory()->create(['slug' => 'leedon-villa-seminyak']);
})->throws(QueryException::class);

it('soft deletes rather than removing the row', function () {
    $property = Property::factory()->create();

    $property->delete();

    expect(Property::find($property->id))->toBeNull()
        ->and(Property::withTrashed()->find($property->id))->not->toBeNull()
        ->and($property->fresh()->deleted_at)->not->toBeNull();
});

it('restores a soft deleted property', function () {
    $property = Property::factory()->create();
    $property->delete();

    $property->restore();

    expect(Property::find($property->id))->not->toBeNull();
});

it('casts category to a backed enum', function () {
    $property = Property::factory()->create(['category' => PropertyCategory::Resort]);

    expect($property->fresh()->category)->toBe(PropertyCategory::Resort);
});

it('casts is_published to a boolean and keeps rating to one decimal', function () {
    $property = Property::factory()->create([
        'is_published' => 1,
        'rating' => 4.5,
    ]);

    expect($property->fresh()->is_published)->toBeTrue()
        ->and((float) $property->fresh()->rating)->toBe(4.5);
});

it('allows price_from, rating and cta_url to be absent', function () {
    $property = Property::factory()->create([
        'price_from' => null,
        'rating' => null,
        'cta_url' => null,
    ]);

    expect($property->fresh())
        ->price_from->toBeNull()
        ->rating->toBeNull()
        ->cta_url->toBeNull();
});

it('applies the schema defaults when a row is inserted without them', function () {
    $id = DB::table('properties')->insertGetId([
        'title' => 'Minimal row',
        'slug' => 'minimal-row',
        'location' => 'Seminyak, Bali',
        'excerpt' => 'A short description.',
        'image_path' => 'properties/minimal.webp',
        'image_alt' => 'A villa at dusk.',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $property = Property::findOrFail($id);

    expect($property->category)->toBe(PropertyCategory::Villa)
        ->and($property->currency)->toBe('IDR')
        ->and($property->sort_order)->toBe(0)
        ->and($property->is_published)->toBeFalse()
        ->and($property->published_at)->toBeNull();
});
