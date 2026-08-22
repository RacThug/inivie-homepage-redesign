<?php

use App\Models\Property;

/*
| Domain rules D1 and D2. See docs/DATA-MODEL.md ch. 3.
*/

it('excludes drafts from the published scope', function () {
    Property::factory()->published()->create(['title' => 'Live']);
    Property::factory()->draft()->create(['title' => 'Draft']);

    expect(Property::published()->inDisplayOrder()->pluck('title')->all())->toBe(['Live']);
});

it('excludes soft deleted rows from the published scope', function () {
    Property::factory()->published()->create(['title' => 'Live']);
    Property::factory()->published()->create(['title' => 'Removed'])->delete();

    expect(Property::published()->inDisplayOrder()->pluck('title')->all())->toBe(['Live']);
});

it('orders by sort_order ascending', function () {
    Property::factory()->published()->create(['title' => 'Third', 'sort_order' => 30]);
    Property::factory()->published()->create(['title' => 'First', 'sort_order' => 10]);
    Property::factory()->published()->create(['title' => 'Second', 'sort_order' => 20]);

    expect(Property::published()->inDisplayOrder()->pluck('title')->all())
        ->toBe(['First', 'Second', 'Third']);
});

it('breaks a sort_order tie with the newest row first', function () {
    Property::factory()->published()->create([
        'title' => 'Older',
        'sort_order' => 10,
        'created_at' => '2026-08-01 00:00:00',
    ]);
    Property::factory()->published()->create([
        'title' => 'Newer',
        'sort_order' => 10,
        'created_at' => '2026-08-20 00:00:00',
    ]);

    expect(Property::published()->inDisplayOrder()->pluck('title')->all())->toBe(['Newer', 'Older']);
});

it('applies sort_order before the created_at tiebreaker', function () {
    Property::factory()->published()->create([
        'title' => 'Newest but last',
        'sort_order' => 20,
        'created_at' => '2026-08-20 00:00:00',
    ]);
    Property::factory()->published()->create([
        'title' => 'Oldest but first',
        'sort_order' => 10,
        'created_at' => '2026-08-01 00:00:00',
    ]);

    expect(Property::published()->inDisplayOrder()->pluck('title')->all())
        ->toBe(['Oldest but first', 'Newest but last']);
});
