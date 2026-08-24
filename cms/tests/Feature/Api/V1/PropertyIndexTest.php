<?php

use App\Enums\ImageFocus;
use App\Enums\PropertyCategory;
use App\Models\Property;

/*
| The public list endpoint of docs/API-SPEC.md ch. 3. Ordering and
| filtering are asserted through the endpoint rather than through the
| model scopes, because ch. 3.4 makes the response, not the query
| builder, the thing the frontend is allowed to rely on.
|
| The exact key set of ch. 3.3 is written out in CONTRACT_KEYS rather
| than derived from PropertyResource. A test that asks the resource what
| it returns cannot notice the resource returning the wrong thing.
*/

/** @var list<string> */
const CONTRACT_KEYS = [
    'id',
    'title',
    'slug',
    'category',
    'location',
    'excerpt',
    'image_url',
    'image_alt',
    'image_focus',
    'price_from',
    'currency',
    'rating',
    'cta_url',
    'sort_order',
];

it('returns exactly the documented fields, in the documented order', function () {
    Property::factory()->published()->create();

    $item = $this->getJson('/api/v1/properties')->json('data.0');

    expect(array_keys($item))->toBe(CONTRACT_KEYS);
});

it('never exposes internal state', function () {
    Property::factory()->published()->create();

    $item = $this->getJson('/api/v1/properties')->json('data.0');

    expect($item)->not->toHaveKeys([
        'is_published',
        'published_at',
        'created_at',
        'updated_at',
        'deleted_at',
        'image_path',
    ]);
});

it('types every field as docs/API-SPEC.md ch. 3.3 declares it', function () {
    $property = Property::factory()->published()->create([
        'price_from' => 3_200_000,
        'rating' => 4.8,
        'sort_order' => 10,
    ]);

    $item = $this->getJson('/api/v1/properties')->json('data.0');

    expect($item)
        ->id->toBe($property->id)
        ->title->toBeString()
        ->slug->toBeString()
        ->category->toBeString()
        ->location->toBeString()
        ->excerpt->toBeString()
        ->image_url->toBeString()
        ->image_alt->toBeString()
        ->image_focus->toBe('center')
        ->price_from->toBe(3_200_000)
        ->currency->toBeString()
        // A float, not the "4.8" the decimal:1 cast produces. The frontend
        // types this as a number and would render a quoted string.
        ->rating->toBe(4.8)
        ->cta_url->toBeString()
        ->sort_order->toBe(10);
});

it('carries the focus the editor chose, not the default', function () {
    // The frontend cannot work this out: only the editor knows where the
    // subject of their photograph is, so the value has to travel.
    Property::factory()->published()->create(['image_focus' => ImageFocus::Top]);

    expect($this->getJson('/api/v1/properties')->json('data.0.image_focus'))->toBe('top');
});

it('serialises the nullable fields as null rather than omitting them', function () {
    Property::factory()->published()->create([
        'price_from' => null,
        'rating' => null,
        'cta_url' => null,
    ]);

    $item = $this->getJson('/api/v1/properties')->json('data.0');

    // P8: present and null, so rule D7 can branch on the value. An absent
    // key and a null one look the same in JavaScript until someone writes
    // `in`, which is the exact class of defect PRD ch. 2.3 records.
    expect(array_keys($item))->toBe(CONTRACT_KEYS)
        ->and($item['price_from'])->toBeNull()
        ->and($item['rating'])->toBeNull()
        ->and($item['cta_url'])->toBeNull();
});

it('derives an absolute image url from the stored relative path', function () {
    Property::factory()->published()->create([
        'image_path' => 'properties/leedon-villa-seminyak.webp',
    ]);

    $url = $this->getJson('/api/v1/properties')->json('data.0.image_url');

    // P6. The frontend never assembles a path, and next/image refuses a
    // relative one.
    expect($url)->toBe(config('app.url').'/storage/properties/leedon-villa-seminyak.webp');
});

it('returns published properties only', function () {
    $published = Property::factory()->published()->create();
    Property::factory()->draft()->create();
    Property::factory()->published()->create()->delete();

    $response = $this->getJson('/api/v1/properties');

    // D1: draft rows and soft deleted rows are both invisible here.
    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($published->id);
});

it('orders by sort_order ascending', function () {
    $last = Property::factory()->published()->create(['sort_order' => 30]);
    $first = Property::factory()->published()->create(['sort_order' => 10]);
    $middle = Property::factory()->published()->create(['sort_order' => 20]);

    $ids = $this->getJson('/api/v1/properties')->json('data.*.id');

    expect($ids)->toBe([$first->id, $middle->id, $last->id]);
});

it('breaks a sort_order tie with the most recently created row first', function () {
    $older = Property::factory()->published()->create([
        'sort_order' => 10,
        'created_at' => now()->subDay(),
    ]);
    $newer = Property::factory()->published()->create([
        'sort_order' => 10,
        'created_at' => now(),
    ]);

    $ids = $this->getJson('/api/v1/properties')->json('data.*.id');

    // D2. Without the tiebreaker the order of equal rows is whatever the
    // storage engine feels like, which is stable until the day it is not.
    expect($ids)->toBe([$newer->id, $older->id]);
});

it('returns three properties when no limit is given', function () {
    Property::factory()->published()->count(5)->create();

    expect($this->getJson('/api/v1/properties')->json('data'))->toHaveCount(3);
});

it('returns as many properties as the limit asks for', function () {
    Property::factory()->published()->count(5)->create();

    expect($this->getJson('/api/v1/properties?limit=5')->json('data'))->toHaveCount(5);
});

it('reports the number of returned properties as meta.count', function () {
    Property::factory()->published()->count(5)->create();

    expect($this->getJson('/api/v1/properties?limit=2')->json('meta.count'))->toBe(2);
});

it('filters by category', function () {
    Property::factory()->published()->create(['category' => PropertyCategory::Villa]);
    $resort = Property::factory()->published()->create(['category' => PropertyCategory::Resort]);

    $response = $this->getJson('/api/v1/properties?category=resort');

    expect($response->json('data'))->toHaveCount(1)
        ->and($response->json('data.0.id'))->toBe($resort->id);
});

it('answers an empty result with 200 and an empty array', function () {
    Property::factory()->draft()->create();

    // ch. 3.5. Zero published properties is a valid state. A 404 would
    // make the frontend treat "nothing to show" as "something broke".
    $this->getJson('/api/v1/properties')
        ->assertOk()
        ->assertExactJson([
            'data' => [],
            'meta' => ['count' => 0],
        ]);
});

it('rejects a limit outside the documented bounds', function (string $limit) {
    Property::factory()->published()->create();

    $this->getJson("/api/v1/properties?limit={$limit}")
        ->assertUnprocessable()
        ->assertJsonValidationErrorFor('limit');
})->with([
    'zero' => '0',
    'negative' => '-1',
    'above the cap' => '13',
    'not a number' => 'all',
    'fractional' => '1.5',
    // The cap of 12 exists so a crafted request cannot turn a public read
    // endpoint into a full table dump.
    'a table dump' => '100000',
]);

it('rejects a category outside the enum', function () {
    Property::factory()->published()->create();

    $this->getJson('/api/v1/properties?category=hostel')
        ->assertUnprocessable()
        ->assertJsonValidationErrorFor('category');
});

it('accepts the documented categories', function (string $category) {
    $this->getJson("/api/v1/properties?category={$category}")->assertOk();
})->with(['resort', 'villa', 'hotel']);

it('accepts every limit within the documented bounds', function () {
    foreach (range(1, 12) as $limit) {
        $this->getJson("/api/v1/properties?limit={$limit}")->assertOk();
    }
});
