<?php

use App\Models\Property;

/*
| Domain rule D4, generation half. docs/DATA-MODEL.md ch. 2 describes the
| slug as generated from the title and manually editable. The uniqueness
| half is the database constraint, covered in PropertySchemaTest.
*/

it('derives the slug from the title when none is given', function () {
    $property = Property::factory()->create([
        'title' => 'Leedon Villa Seminyak',
        'slug' => null,
    ]);

    expect($property->slug)->toBe('leedon-villa-seminyak');
});

it('keeps a slug the editor supplied', function () {
    $property = Property::factory()->create([
        'title' => 'Leedon Villa Seminyak',
        'slug' => 'leedon-seminyak',
    ]);

    expect($property->slug)->toBe('leedon-seminyak');
});

it('does not rewrite the slug when the title later changes', function () {
    $property = Property::factory()->create([
        'title' => 'Leedon Villa Seminyak',
        'slug' => null,
    ]);

    $property->update(['title' => 'Leedon Villa Petitenget']);

    expect($property->fresh()->slug)->toBe('leedon-villa-seminyak');
});

it('strips punctuation and casing from the generated slug', function () {
    $property = Property::factory()->create([
        'title' => "La Mewali's Cliff Resort, Uluwatu",
        'slug' => null,
    ]);

    expect($property->slug)->toBe('la-mewalis-cliff-resort-uluwatu');
});
