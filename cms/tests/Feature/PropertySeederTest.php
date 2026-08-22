<?php

use App\Models\Property;
use Database\Seeders\PropertySeeder;

/*
| Seed data, docs/DATA-MODEL.md ch. 4. The two drafts are not padding:
| they are the evidence that D1 works, since a reviewer sees 6 rows in
| the CMS and exactly 4 on the homepage.
*/

beforeEach(function () {
    $this->seed(PropertySeeder::class);
});

it('seeds six properties, four of them published', function () {
    expect(Property::count())->toBe(6)
        ->and(Property::published()->count())->toBe(4);
});

it('seeds the titles the data model names', function () {
    expect(Property::orderBy('id')->pluck('title')->all())->toBe([
        'Leedon Villa Seminyak',
        'Ajowa Resort',
        'La Mewali Resort',
        'Astera Canggu',
        'Seascape Sanur',
        'Svaha Retreat Ubud',
    ]);
});

it('gives every seeded property alternative text and an image', function () {
    Property::each(function (Property $property) {
        expect($property->image_alt)->not->toBeEmpty()
            ->and($property->image_path)->not->toBeEmpty();
    });
});

it('gives every published property a published_at', function () {
    Property::published()->each(function (Property $property) {
        expect($property->published_at)->not->toBeNull();
    });
});

it('leaves the drafts without a published_at', function () {
    Property::where('is_published', false)->each(function (Property $property) {
        expect($property->published_at)->toBeNull();
    });
});

it('is idempotent, so re-seeding does not duplicate rows', function () {
    $this->seed(PropertySeeder::class);

    expect(Property::count())->toBe(6);
});
