<?php

use App\Models\Property;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Tests\Support\FakeImage;

/*
| Capabilities C2, C3 and C5: create, read, update, and delete a property
| from the panel. The validation half of C8 is in PropertyValidationTest.
|
| The disk is faked in every test, so nothing here writes to
| storage/app/public, and the assertions about what landed on it are exact
| rather than "a file exists somewhere".
*/

beforeEach(function () {
    $this->actingAs(User::factory()->create());

    // The seam's configured disk, not a hardcoded name: a test that faked
    // `public` while the application wrote to `s3` would pass without ever
    // exercising the same disk twice.
    Storage::fake(config('filesystems.default'));
});

describe('index', function () {
    it('lists every property, drafts included', function () {
        $published = Property::factory()->published()->create(['title' => 'Aria Resort Ubud']);
        $draft = Property::factory()->draft()->create(['title' => 'Kirana Villa Canggu']);

        $this->get(route('admin.properties.index'))
            ->assertOk()
            ->assertSee($published->title)
            ->assertSee($draft->title);
    });

    it('hides a soft deleted property', function () {
        // D5. The row is gone from the panel as far as the admin is
        // concerned, even though the record and its image survive.
        $property = Property::factory()->create(['title' => 'Removed Villa Sanur']);
        $property->delete();

        $this->get(route('admin.properties.index'))
            ->assertOk()
            ->assertDontSee($property->title);
    });

    it('orders the list the way the homepage renders it', function () {
        // D2, so the admin is looking at the running order rather than at
        // insertion order.
        Property::factory()->create(['title' => 'Third', 'sort_order' => 9]);
        Property::factory()->create(['title' => 'First', 'sort_order' => 1]);
        Property::factory()->create(['title' => 'Second', 'sort_order' => 4]);

        $response = $this->get(route('admin.properties.index'))->assertOk();

        expect($response->viewData('properties')->pluck('title')->all())
            ->toBe(['First', 'Second', 'Third']);
    });

    it('offers the first property rather than an empty table', function () {
        $this->get(route('admin.properties.index'))
            ->assertOk()
            ->assertSee('No properties yet')
            ->assertSee('Add the first property');
    });
});

describe('create', function () {
    it('renders the form', function () {
        $this->get(route('admin.properties.create'))
            ->assertOk()
            ->assertSee('New property')
            ->assertSee('Create property');
    });

    it('stores a property and says so', function () {
        $response = $this->post(route('admin.properties.store'), propertyForm());

        $response->assertRedirect(route('admin.properties.index'));
        $response->assertSessionHas('status', '"Leedon Villa Seminyak" has been created.');

        $property = Property::sole();

        expect($property->title)->toBe('Leedon Villa Seminyak')
            ->and($property->category->value)->toBe('villa')
            ->and($property->price_from)->toBe(4500000)
            ->and((float) $property->rating)->toBe(4.8)
            ->and($property->sort_order)->toBe(3)
            ->and($property->is_published)->toBeTrue();
    });

    it('puts the upload on the configured disk under a hashed name', function () {
        $this->post(route('admin.properties.store'), propertyForm());

        $path = Property::sole()->image_path;

        // The stored value is a relative path, never a URL. That is the
        // first rule of the storage seam in TECHNICAL-DESIGN ch. 5.5: a
        // stored URL would bake the host into every row.
        expect($path)->toStartWith('properties/')
            ->and($path)->not->toContain('http')
            ->and($path)->not->toContain('villa.png');

        Storage::disk(config('filesystems.default'))->assertExists($path);
    });

    it('derives the slug from the title when the field is left blank', function () {
        // D4. The rules see the derived value, so a collision comes back as
        // a message rather than as a constraint violation.
        $this->post(route('admin.properties.store'), propertyForm([
            'title' => 'La Mewali Cliff Resort',
            'slug' => '',
        ]));

        expect(Property::sole()->slug)->toBe('la-mewali-cliff-resort');
    });

    it('stamps published_at on a property created as published', function () {
        // D6, through the observer rather than through the controller.
        $this->post(route('admin.properties.store'), propertyForm(['is_published' => '1']));

        expect(Property::sole()->published_at)->not->toBeNull();
    });

    it('leaves published_at null on a draft', function () {
        $this->post(route('admin.properties.store'), propertyForm(['is_published' => null]));

        $property = Property::sole();

        expect($property->is_published)->toBeFalse()
            ->and($property->published_at)->toBeNull();
    });
});

describe('edit', function () {
    it('renders the form with the current values', function () {
        $property = Property::factory()->create(['title' => 'Aria Resort Ubud']);

        $this->get(route('admin.properties.edit', $property))
            ->assertOk()
            ->assertSee($property->title)
            ->assertSee($property->slug)
            ->assertSee('Save changes');
    });

    it('updates the fields it was given', function () {
        $property = Property::factory()->published()->create(['title' => 'Aria Resort Ubud']);

        $response = $this->put(route('admin.properties.update', $property), propertyForm([
            'title' => 'Aria Resort Ubud',
            'slug' => $property->slug,
            'excerpt' => 'Rewritten copy for the card.',
            'image' => null,
        ]));

        $response->assertRedirect(route('admin.properties.index'));
        $response->assertSessionHas('status', '"Aria Resort Ubud" has been updated.');

        expect($property->fresh()->excerpt)->toBe('Rewritten copy for the card.');
    });

    it('keeps the existing image when no new file is chosen', function () {
        // ch. 5.3 leaves the upload optional on update, so an edit that
        // fixes a typo must not blank the column the homepage renders from.
        $property = Property::factory()->create(['image_path' => 'properties/original.webp']);

        $this->put(route('admin.properties.update', $property), propertyForm([
            'slug' => $property->slug,
            'image' => null,
        ]));

        expect($property->fresh()->image_path)->toBe('properties/original.webp');
    });

    it('replaces the image when a new file is chosen', function () {
        $property = Property::factory()->create(['image_path' => 'properties/original.webp']);

        $this->put(route('admin.properties.update', $property), propertyForm([
            'slug' => $property->slug,
            'image' => FakeImage::png('replacement.png', 1200, 900),
        ]));

        $path = $property->fresh()->image_path;

        // What this case owes is that the column points at the new file.
        // What happens to the file it replaced is the subject of
        // PropertyImageCleanupTest.
        expect($path)->not->toBe('properties/original.webp')
            ->and($path)->toStartWith('properties/');

        Storage::disk(config('filesystems.default'))->assertExists($path);
    });

    it('unpublishes when the checkbox is cleared', function () {
        // An unchecked box is not submitted at all. Without the request
        // object normalising it, the update would silently keep the old
        // value and the property would stay on the homepage.
        $property = Property::factory()->published()->create();

        $this->put(route('admin.properties.update', $property), propertyForm([
            'slug' => $property->slug,
            'image' => null,
            'is_published' => null,
        ]));

        expect($property->fresh()->is_published)->toBeFalse();
    });

    it('keeps the first published_at through an unpublish and a republish', function () {
        // D6 again, from the direction only the admin panel can reach it.
        $property = Property::factory()->published()->create(['published_at' => now()->subMonth()]);
        $originalStamp = $property->published_at;

        $this->put(route('admin.properties.update', $property), propertyForm([
            'slug' => $property->slug,
            'image' => null,
            'is_published' => null,
        ]));

        $this->put(route('admin.properties.update', $property), propertyForm([
            'slug' => $property->slug,
            'image' => null,
            'is_published' => '1',
        ]));

        expect($property->fresh()->published_at->timestamp)->toBe($originalStamp->timestamp);
    });
});

describe('delete', function () {
    it('soft deletes the property and names it in the message', function () {
        $property = Property::factory()->create(['title' => 'Kirana Villa Canggu']);

        $response = $this->delete(route('admin.properties.destroy', $property));

        $response->assertRedirect(route('admin.properties.index'));
        $response->assertSessionHas('status', '"Kirana Villa Canggu" has been deleted.');

        $this->assertSoftDeleted($property);
    });

    it('keeps the image file, because the delete is reversible', function () {
        // D5. A restore with no picture would be a restore of half a
        // property, so files go only on a force delete, in issue #9.
        $this->post(route('admin.properties.store'), propertyForm());

        $property = Property::sole();
        $path = $property->image_path;

        $this->delete(route('admin.properties.destroy', $property));

        Storage::disk(config('filesystems.default'))->assertExists($path);
    });

    it('cannot reach a property that is already deleted', function () {
        $property = Property::factory()->create();
        $property->delete();

        $this->delete(route('admin.properties.destroy', $property))->assertNotFound();
    });
});
