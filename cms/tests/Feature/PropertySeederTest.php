<?php

use App\Models\Property;
use App\Models\User;
use Database\Seeders\PropertySeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/*
| Seed data, docs/DATA-MODEL.md ch. 4.
*/

beforeEach(function () {
    Storage::fake(config('filesystems.default'));

    $this->seed(PropertySeeder::class);
});

it('seeds eight properties, six of them published', function () {
    expect(Property::count())->toBe(8)
        ->and(Property::published()->count())->toBe(6);
});

it('seeds the titles the data model names', function () {
    expect(Property::orderBy('id')->pluck('title')->all())->toBe([
        'Leedon Villa Seminyak',
        'Ajowa Resort',
        'La Mewali Resort',
        'Astera Canggu',
        'Ini Vie Villa Legian',
        'Aeera Villa Canggu',
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

it('seeds pictures the upload form itself would accept', function () {
    // TECHNICAL-DESIGN ch. 5.3 governs what an admin may upload, and seed
    // data held to a lower bar looks fine until the first reviewer
    // re-uploads one of these files and is told it is too small.
    //
    // Restating the mime list and the 2 MB cap here would be the second
    // copy of a rules table ch. 5.3 warns drifts, and the copy that drifts
    // is the one nobody reads. So this submits each seed picture through
    // the create form and requires it to be taken.
    $this->actingAs(User::factory()->create());

    Property::pluck('image_path')->each(function (string $path) {
        $name = basename($path);

        // Uploaded through a copy, never the committed file itself. Laravel
        // streams rather than moves, but a test that can empty the
        // repository if that ever changes is not worth the risk.
        $upload = tempnam(sys_get_temp_dir(), 'seed');
        copy(database_path('seeders/images/'.$name), $upload);

        $this->post(route('admin.properties.store'), propertyForm([
            'slug' => 'upload-check-'.basename($name, '.webp'),
            'image' => new UploadedFile($upload, $name, 'image/webp', null, true),
        ]))->assertSessionHasNoErrors();
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

    expect(Property::count())->toBe(8);
});

it('leaves a soft deleted property deleted when the seeder runs again', function () {
    $property = Property::where('slug', 'ajowa-resort')->firstOrFail();
    $property->delete();

    $this->seed(PropertySeeder::class);

    expect(Property::where('slug', 'ajowa-resort')->exists())->toBeFalse()
        ->and(Property::withTrashed()->where('slug', 'ajowa-resort')->exists())->toBeTrue();
});
