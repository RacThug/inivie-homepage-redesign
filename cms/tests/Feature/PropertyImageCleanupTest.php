<?php

use App\Models\Property;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\Support\FakeImage;

/*
| Capability C4 and the file lifecycle in docs/TECHNICAL-DESIGN.md ch. 5.4.
|
| The rules under test are about what happens to a file when the row that
| points at it changes, which is why they are asserted against the model
| rather than only through the panel: an image_path rewritten from a future
| bulk import has to leave the same disk behind as one rewritten from the
| edit form.
*/

beforeEach(function () {
    $this->actingAs(User::factory()->create());
    Storage::fake(config('filesystems.default'));
});

it('removes the file a new upload replaced', function () {
    $property = propertyWithRealImage();
    $replaced = $property->image_path;

    $this->put(route('admin.properties.update', $property), propertyForm([
        'slug' => $property->slug,
        'image' => FakeImage::png('replacement.png', 1200, 900),
    ]));

    $disk = Storage::disk(config('filesystems.default'));

    $disk->assertMissing($replaced);
    $disk->assertExists($property->fresh()->image_path);
});

it('removes nothing when an edit changes no file', function () {
    $property = propertyWithRealImage();

    $this->put(route('admin.properties.update', $property), propertyForm([
        'slug' => $property->slug,
        'excerpt' => 'Rewritten copy, same photograph.',
        'image' => null,
    ]));

    Storage::disk(config('filesystems.default'))->assertExists($property->image_path);
});

it('cleans up on any path that rewrites the column, not only the form', function () {
    // The invariant belongs to the model, so it holds for a bulk import or a
    // Tinker session as well. A cleanup that only exists in the controller is
    // a cleanup the next writer forgets.
    $property = propertyWithRealImage();
    $replaced = $property->image_path;

    $property->update(['image_path' => 'properties/somewhere-else.webp']);

    Storage::disk(config('filesystems.default'))->assertMissing($replaced);
});

it('keeps the replaced file when the save is rolled back', function () {
    // ch. 5.4: the old file goes only once the record has genuinely saved.
    // Deleting it first would leave the property pointing at a file that no
    // longer exists, with nothing to restore it from.
    $property = propertyWithRealImage();
    $replaced = $property->image_path;

    try {
        DB::transaction(function () use ($property) {
            $property->update(['image_path' => 'properties/never-committed.webp']);

            throw new RuntimeException('Something later in the transaction failed.');
        });
    } catch (RuntimeException) {
        // The point of the test is what survives the rollback.
    }

    Storage::disk(config('filesystems.default'))->assertExists($replaced);
    expect($property->fresh()->image_path)->toBe($replaced);
});

it('keeps the file on a soft delete', function () {
    // D5. A restore with no picture would be a restore of half a property.
    $property = propertyWithRealImage();

    $property->delete();

    Storage::disk(config('filesystems.default'))->assertExists($property->image_path);
});

it('removes the file on a force delete', function () {
    // The only point at which the row is genuinely gone, so it is the only
    // point at which the file can be.
    $property = propertyWithRealImage();

    $property->forceDelete();

    Storage::disk(config('filesystems.default'))->assertMissing($property->image_path);
});

it('follows the configured disk rather than one it decided for itself', function () {
    // The seam in ch. 5.5, asserted rather than asserted about: moving to
    // object storage is meant to be `FILESYSTEM_DISK`, credentials, and a
    // media host, with no code change. A hardcoded `public` anywhere in the
    // store would pass every other test in this file and fail this one.
    config(['filesystems.default' => 'somewhere-else']);
    Storage::fake('somewhere-else');

    $this->post(route('admin.properties.store'), propertyForm());

    Storage::disk('somewhere-else')->assertExists(Property::sole()->image_path);
});
