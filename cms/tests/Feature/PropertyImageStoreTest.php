<?php

use App\Services\PropertyImageStore;
use Illuminate\Support\Facades\Storage;

/*
| The import half of the storage seam, docs/TECHNICAL-DESIGN.md ch. 5.5.
|
| `store()` puts an admin's upload on the disk. `import()` puts a file that
| ships with the repository there instead, which is the one way the seed
| images of DATA-MODEL ch. 4 reach the disk. Both go through the same object
| because ch. 5.5 allows exactly one place that touches storage.
*/

beforeEach(function () {
    Storage::fake(config('filesystems.default'));

    $this->store = app(PropertyImageStore::class);
    $this->disk = Storage::disk(config('filesystems.default'));
    $this->source = database_path('seeders/images/leedon-villa-seminyak.webp');
    $this->destination = 'properties/leedon-villa-seminyak.webp';
});

it('copies a repository file onto the configured disk', function () {
    $this->store->import($this->source, $this->destination);

    $this->disk->assertExists($this->destination);
});

it('copies the bytes, not just the name', function () {
    $this->store->import($this->source, $this->destination);

    expect($this->disk->get($this->destination))->toBe(file_get_contents($this->source));
});

it('overwrites what is already at the destination', function () {
    // Seeding is a reset to a known state, so an image an editor replaced
    // comes back. Skipping the write instead would leave the row pointing at
    // the canonical path while the disk still held something else.
    $this->disk->put($this->destination, 'stale');

    $this->store->import($this->source, $this->destination);

    expect($this->disk->get($this->destination))->not->toBe('stale');
});

it('refuses a source file that is not there', function () {
    // The failure #27 was: a seeded row pointing at a file nobody committed,
    // invisible until a screen tried to render it. A named exception at seed
    // time is the whole difference between that and a broken thumbnail.
    expect(fn () => $this->store->import(
        database_path('seeders/images/no-such-property.webp'),
        'properties/no-such-property.webp',
    ))->toThrow(InvalidArgumentException::class, 'no-such-property.webp');
});
