<?php

use App\Enums\ImageFocus;
use App\Models\Property;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Tests\Support\FakeImage;

/*
| Capability C8 and the rules table in docs/TECHNICAL-DESIGN.md ch. 5.3.
|
| Every rule in that table is asserted here, because the table is a promise
| about what the public API can contain: a rule that quietly stopped firing
| would first be noticed as a broken card on the homepage.
*/

beforeEach(function () {
    $this->actingAs(User::factory()->create());
    Storage::fake(config('filesystems.default'));
});

it('rejects a submission with nothing in it', function () {
    $this->post(route('admin.properties.store'), [])
        ->assertSessionHasErrors([
            'title',
            'slug',
            'category',
            'location',
            'excerpt',
            'image',
            'image_alt',
            'sort_order',
        ]);

    expect(Property::count())->toBe(0);
});

it('writes nothing at all when validation fails', function () {
    // Neither a row nor a file. An upload that survived a rejected form
    // would leave the disk collecting files nothing points at.
    $this->post(route('admin.properties.store'), propertyForm(['title' => '']));

    expect(Property::count())->toBe(0)
        ->and(Storage::disk(config('filesystems.default'))->allFiles())->toBeEmpty();
});

it('leaves the property and the disk untouched when an edit is rejected', function () {
    // C8, update half. The same "writes nothing at all" rule as above,
    // and it has one thing to
    // lose the create path does not: a property that is already live. A
    // rejected edit that half applied would change the homepage on the
    // strength of a form the admin was told had failed.
    $property = propertyWithRealImage();
    $before = $property->only(['title', 'excerpt', 'image_path']);

    $this->put(route('admin.properties.update', $property), propertyForm([
        'slug' => $property->slug,
        'title' => '',
        'excerpt' => 'Rewritten copy that must not land.',
        'image' => FakeImage::png('replacement.png', 1200, 900),
    ]))->assertSessionHasErrors('title');

    expect($property->fresh()->only(['title', 'excerpt', 'image_path']))->toBe($before)
        // The rejected upload never reached the disk either, so the edit
        // form cannot be used to fill storage with files no row points at.
        ->and(Storage::disk(config('filesystems.default'))->allFiles())
        ->toBe([$before['image_path']]);
});

it('returns the submitted values to the form', function () {
    // The second half of C8. The admin fixes the one field that was wrong
    // rather than retyping the eleven that were right.
    $this->post(route('admin.properties.store'), propertyForm([
        'title' => 'Kirana Villa Canggu',
        'rating' => 9,
    ]))->assertSessionHasErrors('rating');

    expect(session()->getOldInput('title'))->toBe('Kirana Villa Canggu')
        ->and(session()->getOldInput('location'))->toBe('Seminyak, Bali');
});

it('rejects a value that is too long', function (string $field, int $max) {
    $this->post(route('admin.properties.store'), propertyForm([
        $field => str_repeat('a', $max + 1),
    ]))->assertSessionHasErrors($field);
})->with([
    'title at 120' => ['title', 120],
    'location at 120' => ['location', 120],
    'excerpt at 240' => ['excerpt', 240],
    'image_alt at 160' => ['image_alt', 160],
]);

describe('slug', function () {
    it('rejects characters that do not belong in a URL', function () {
        $this->post(route('admin.properties.store'), propertyForm([
            'slug' => 'not a slug!',
        ]))->assertSessionHasErrors('slug');
    });

    it('rejects a slug another property already uses', function () {
        Property::factory()->create(['slug' => 'aria-resort-ubud']);

        $this->post(route('admin.properties.store'), propertyForm([
            'slug' => 'aria-resort-ubud',
        ]))->assertSessionHasErrors(['slug' => 'Another property already uses this slug.']);
    });

    it('rejects a slug a soft deleted property still holds', function () {
        // D4 is unique across all properties including the deleted ones,
        // because a restore must not collide with a slug taken in the
        // meantime. The rule is written against the table for exactly this.
        Property::factory()->create(['slug' => 'aria-resort-ubud'])->delete();

        $this->post(route('admin.properties.store'), propertyForm([
            'slug' => 'aria-resort-ubud',
        ]))->assertSessionHasErrors('slug');
    });

    it('lets a property keep its own slug on update', function () {
        $property = Property::factory()->create(['slug' => 'aria-resort-ubud']);

        $this->put(route('admin.properties.update', $property), propertyForm([
            'slug' => 'aria-resort-ubud',
            'image' => null,
        ]))->assertSessionHasNoErrors();
    });
});

describe('image', function () {
    it('is required on create', function () {
        $this->post(route('admin.properties.store'), propertyForm(['image' => null]))
            ->assertSessionHasErrors('image');
    });

    it('is optional on update', function () {
        $property = Property::factory()->create();

        $this->put(route('admin.properties.update', $property), propertyForm([
            'slug' => $property->slug,
            'image' => null,
        ]))->assertSessionHasNoErrors();
    });

    it('rejects a file that is not an image', function () {
        $this->post(route('admin.properties.store'), propertyForm([
            'image' => FakeImage::notAnImage(),
        ]))->assertSessionHasErrors('image');
    });

    it('takes a small image, because nothing floors the dimensions', function () {
        // A floor of 800 by 600 stood here and was removed on purpose, so
        // this pins the decision rather than leaving the hole where a test
        // used to be. There is no server side resizing, so a small picture
        // is rendered soft on a 400px card; that is a worse looking card
        // rather than a broken one, and refusing an editor over it is an
        // unusual thing for a CMS to do. See ch. 5.3.
        $this->post(route('admin.properties.store'), propertyForm([
            'image' => FakeImage::png('small.png', 320, 240),
        ]))->assertSessionHasNoErrors();
    });

    it('rejects an image over 2 MB', function () {
        $this->post(route('admin.properties.store'), propertyForm([
            'image' => FakeImage::png('huge.png', 1200, 900, padToKilobytes: 2100),
        ]))->assertSessionHasErrors(['image' => 'The image may not be larger than 2 MB.']);
    });
});

describe('image focus', function () {
    it('takes each of the three the enum names', function () {
        foreach (ImageFocus::cases() as $index => $focus) {
            $this->post(route('admin.properties.store'), propertyForm([
                'title' => "Focus {$focus->value}",
                'slug' => "focus-{$focus->value}",
                'image_focus' => $focus->value,
            ]))->assertSessionHasNoErrors();

            expect(Property::where('slug', "focus-{$focus->value}")->value('image_focus'))
                ->toBe($focus);
        }
    });

    it('refuses a position that is not one of them', function () {
        // The select offers three, so anything else is a request that did
        // not come from the form, and the card has no CSS for it.
        $this->post(route('admin.properties.store'), propertyForm([
            'image_focus' => 'north-by-northwest',
        ]))->assertSessionHasErrors('image_focus');
    });

    it('is required, because the form always sends one', function () {
        $this->post(route('admin.properties.store'), propertyForm(['image_focus' => null]))
            ->assertSessionHasErrors('image_focus');
    });
});

describe('the optional fields', function () {
    it('accepts a submission with all of them empty', function () {
        $this->post(route('admin.properties.store'), propertyForm([
            'price_from' => null,
            'rating' => null,
            'cta_url' => null,
        ]))->assertSessionHasNoErrors();

        $property = Property::sole();

        expect($property->price_from)->toBeNull()
            ->and($property->rating)->toBeNull()
            ->and($property->cta_url)->toBeNull();
    });

    it('rejects a bad value', function (string $field, mixed $value) {
        $this->post(route('admin.properties.store'), propertyForm([$field => $value]))
            ->assertSessionHasErrors($field);
    })->with([
        'a negative price' => ['price_from', -1],
        'a fractional price' => ['price_from', 1500.5],
        'a rating above five' => ['rating', 5.1],
        'a negative rating' => ['rating', -0.1],
        'a link that is not a URL' => ['cta_url', 'inivie'],
        'a negative order' => ['sort_order', -1],
        // The column is a smallint unsigned, per DATA-MODEL ch. 1. Without
        // the ceiling the write reaches MySQL and comes back as a 500, or
        // outside strict mode is truncated while the admin is told it saved.
        'an order the column cannot hold' => ['sort_order', 65536],
        'a category that does not exist' => ['category', 'glamping'],
    ]);
});
