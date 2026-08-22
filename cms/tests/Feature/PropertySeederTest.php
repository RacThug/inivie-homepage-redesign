<?php

use App\Models\Property;
use Database\Seeders\PropertySeeder;
use Illuminate\Support\Facades\Storage;

/*
| Seed data, docs/DATA-MODEL.md ch. 4.
*/

beforeEach(function () {
    Storage::fake(config('filesystems.default'));

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

it('puts the picture of every seeded property on the configured disk', function () {
    // ch. 4 promises that `migrate --seed` alone produces a populated
    // homepage. A row whose image_path points at nothing keeps that promise
    // in the database and breaks it on every screen that renders a card.
    $disk = Storage::disk(config('filesystems.default'));

    Property::each(fn (Property $property) => $disk->assertExists($property->image_path));
});

it('seeds pictures the upload rules would themselves accept', function () {
    // TECHNICAL-DESIGN ch. 5.3 governs what an admin may upload. Seed data
    // held to a lower bar is seed data that looks fine until the first
    // reviewer re-uploads one of these files and is told it is too small.
    $disk = Storage::disk(config('filesystems.default'));

    Property::each(function (Property $property) use ($disk) {
        [$width, $height] = getimagesizefromstring($disk->get($property->image_path));

        expect($width)->toBeGreaterThanOrEqual(800)
            ->and($height)->toBeGreaterThanOrEqual(600)
            ->and($disk->size($property->image_path))->toBeLessThan(2 * 1024 * 1024)
            ->and($disk->mimeType($property->image_path))->toBe('image/webp');
    });
});

it('puts a seed picture back when the disk has lost it', function () {
    $property = Property::where('slug', 'ajowa-resort')->firstOrFail();
    $disk = Storage::disk(config('filesystems.default'));
    $disk->delete($property->image_path);

    $this->seed(PropertySeeder::class);

    $disk->assertExists($property->image_path);
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

it('leaves a soft deleted property deleted when the seeder runs again', function () {
    $property = Property::where('slug', 'ajowa-resort')->firstOrFail();
    $property->delete();

    $this->seed(PropertySeeder::class);

    expect(Property::where('slug', 'ajowa-resort')->exists())->toBeFalse()
        ->and(Property::withTrashed()->where('slug', 'ajowa-resort')->exists())->toBeTrue();
});
