<?php

use App\Models\Property;
use App\Models\User;

/*
| Capability C7 and requirement F2: the card order on the homepage is an
| editorial decision made in the CMS, not insertion order.
|
| The index submits the order of every row it is showing as one batch, and
| the batch is applied inside a transaction, per docs/TECHNICAL-DESIGN.md
| ch. 5.6. So the cases that matter are not only "the order changed" but
| "nothing changed" whenever any part of the submission is refused: a half
| applied reorder is a running order nobody chose.
*/

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('applies a new order and reflects it in the index', function () {
    $first = Property::factory()->create(['title' => 'First', 'sort_order' => 1]);
    $second = Property::factory()->create(['title' => 'Second', 'sort_order' => 2]);
    $third = Property::factory()->create(['title' => 'Third', 'sort_order' => 3]);

    $response = $this->from(route('admin.properties.index'))
        ->post(route('admin.properties.reorder'), [
            'order' => [
                $first->id => 30,
                $second->id => 20,
                $third->id => 10,
            ],
        ]);

    $response->assertRedirect(route('admin.properties.index'));
    $response->assertSessionHas('status', 'The homepage order has been saved.');

    $index = $this->get(route('admin.properties.index'))->assertOk();

    expect($index->viewData('properties')->pluck('title')->all())
        ->toBe(['Third', 'Second', 'First']);
});

it('moves the cards on the homepage with it', function () {
    // F2 and acceptance criterion A11, end to end. The order is only worth
    // editing if the guest sees the result.
    $first = Property::factory()->published()->create(['title' => 'First', 'sort_order' => 1]);
    $second = Property::factory()->published()->create(['title' => 'Second', 'sort_order' => 2]);

    $this->post(route('admin.properties.reorder'), [
        'order' => [$first->id => 5, $second->id => 4],
    ]);

    $titles = $this->getJson('/api/v1/properties')->assertOk()->json('data.*.title');

    expect($titles)->toBe(['Second', 'First']);
});

it('returns to the page the table was on', function () {
    $property = Property::factory()->create();
    $origin = route('admin.properties.index', ['page' => 2]);

    $this->from($origin)
        ->post(route('admin.properties.reorder'), ['order' => [$property->id => 4]])
        ->assertRedirect($origin);
});

it('leaves every row alone when one position is not a whole number', function () {
    $moved = Property::factory()->create(['sort_order' => 1]);
    $untouched = Property::factory()->create(['sort_order' => 2]);

    $response = $this->from(route('admin.properties.index'))
        ->post(route('admin.properties.reorder'), [
            'order' => [$moved->id => 9, $untouched->id => 'first'],
        ]);

    $response->assertSessionHasErrors("order.{$untouched->id}");

    expect($moved->fresh()->sort_order)->toBe(1)
        ->and($untouched->fresh()->sort_order)->toBe(2);
});

it('refuses a position the column cannot hold', function () {
    // `sort_order` is a smallint unsigned, per DATA-MODEL ch. 1. Without the
    // ceiling in the rules the write reaches MySQL and comes back as a 500,
    // or worse, is silently truncated to 65535.
    $property = Property::factory()->create(['sort_order' => 7]);

    $this->from(route('admin.properties.index'))
        ->post(route('admin.properties.reorder'), ['order' => [$property->id => 65536]])
        ->assertSessionHasErrors("order.{$property->id}");

    expect($property->fresh()->sort_order)->toBe(7);
});

it('refuses a negative position', function () {
    $property = Property::factory()->create(['sort_order' => 7]);

    $this->from(route('admin.properties.index'))
        ->post(route('admin.properties.reorder'), ['order' => [$property->id => -1]])
        ->assertSessionHasErrors("order.{$property->id}");

    expect($property->fresh()->sort_order)->toBe(7);
});

it('refuses the whole batch when it names a property that is not there', function () {
    // A table left open while the property was deleted somewhere else. The
    // batch is a statement about a list, so applying the part of it that
    // still resolves would save an order the admin never saw.
    $property = Property::factory()->create(['sort_order' => 1]);
    $deleted = Property::factory()->create(['sort_order' => 2]);
    $deleted->delete();

    $this->from(route('admin.properties.index'))
        ->post(route('admin.properties.reorder'), [
            'order' => [$property->id => 9, $deleted->id => 8],
        ])
        ->assertSessionHasErrors('order');

    expect($property->fresh()->sort_order)->toBe(1);
});

it('refuses a submission with nothing in it', function () {
    $this->from(route('admin.properties.index'))
        ->post(route('admin.properties.reorder'), ['order' => []])
        ->assertSessionHasErrors('order');
});

it('renders an editable position for every row', function () {
    $property = Property::factory()->create(['sort_order' => 4]);

    $this->get(route('admin.properties.index'))
        ->assertOk()
        ->assertSee('name="order['.$property->id.']"', false)
        ->assertSee('Save order');
});
