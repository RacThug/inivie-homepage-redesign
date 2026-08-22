<?php

use App\Models\Property;
use App\Models\User;

/*
| Capability C6: publish or unpublish without opening the edit form, and F1,
| the half of it the guest sees.
|
| The action carries the state it intends rather than flipping whatever it
| finds, so the same submission twice is the same outcome twice. A blind
| toggle turns a double click, a stale tab, or a browser replaying a request
| into the opposite of what the admin asked for, and the only evidence is a
| property that is live when it should not be.
*/

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('publishes a draft from the row action and names the consequence', function () {
    $property = Property::factory()->draft()->create(['title' => 'Aria Resort Ubud']);

    $response = $this->from(route('admin.properties.index'))
        ->patch(route('admin.properties.publish', $property), ['publish' => '1']);

    $response->assertRedirect(route('admin.properties.index'));
    $response->assertSessionHas('status', '"Aria Resort Ubud" is now on the homepage.');

    expect($property->fresh()->is_published)->toBeTrue();
});

it('unpublishes a published property and says where it went', function () {
    // C6 in the acceptance criterion's own words: the property vanishes from
    // the homepage and is preserved in the CMS.
    $property = Property::factory()->published()->create(['title' => 'Kirana Villa Canggu']);

    $response = $this->from(route('admin.properties.index'))
        ->patch(route('admin.properties.publish', $property), ['publish' => '0']);

    $response->assertSessionHas(
        'status',
        '"Kirana Villa Canggu" is now a draft and no longer on the homepage.',
    );

    expect($property->fresh()->is_published)->toBeFalse()
        ->and(Property::withTrashed()->find($property->id))->not->toBeNull();
});

it('takes the draft off the public endpoint', function () {
    // F1 and acceptance criterion A10, end to end: the row action is the
    // thing a guest is protected by, so the assertion is made where the
    // guest looks rather than on the column.
    $property = Property::factory()->published()->create(['title' => 'Aria Resort Ubud']);

    $this->getJson('/api/v1/properties')->assertJsonFragment(['title' => 'Aria Resort Ubud']);

    $this->patch(route('admin.properties.publish', $property), ['publish' => '0']);

    $this->getJson('/api/v1/properties')->assertJsonMissing(['title' => 'Aria Resort Ubud']);
});

it('stamps published_at on the first publish and never rewrites it', function () {
    // D6, reached from the row action rather than from the form. The stamp
    // belongs to the observer, so this is a test that the toggle saves the
    // model instead of writing the column behind it.
    $property = Property::factory()->draft()->create();

    $this->patch(route('admin.properties.publish', $property), ['publish' => '1']);

    $firstStamp = $property->fresh()->published_at;
    expect($firstStamp)->not->toBeNull();

    $this->patch(route('admin.properties.publish', $property), ['publish' => '0']);
    $this->patch(route('admin.properties.publish', $property), ['publish' => '1']);

    expect($property->fresh()->published_at->timestamp)->toBe($firstStamp->timestamp);
});

it('is the same outcome twice, because the request states the state it wants', function () {
    $property = Property::factory()->published()->create();

    $this->patch(route('admin.properties.publish', $property), ['publish' => '1']);
    $this->patch(route('admin.properties.publish', $property), ['publish' => '1']);

    expect($property->fresh()->is_published)->toBeTrue();
});

it('rejects a submission that does not say which state it wants', function () {
    $property = Property::factory()->draft()->create();

    $this->from(route('admin.properties.index'))
        ->patch(route('admin.properties.publish', $property), [])
        ->assertSessionHasErrors('publish');

    expect($property->fresh()->is_published)->toBeFalse();
});

it('returns to the page the row was on', function () {
    // The index is paginated, so a redirect to the bare index would throw
    // an admin working on page two back to page one on every toggle.
    $property = Property::factory()->draft()->create();
    $origin = route('admin.properties.index', ['page' => 2]);

    $this->from($origin)
        ->patch(route('admin.properties.publish', $property), ['publish' => '1'])
        ->assertRedirect($origin);
});

it('cannot reach a property that is already deleted', function () {
    $property = Property::factory()->create();
    $property->delete();

    $this->patch(route('admin.properties.publish', $property), ['publish' => '1'])
        ->assertNotFound();
});

it('offers unpublish on a published row', function () {
    Property::factory()->published()->create(['title' => 'Aria Resort Ubud']);

    $this->get(route('admin.properties.index'))
        ->assertOk()
        ->assertSee('Unpublish');
});

it('offers publish on a draft row', function () {
    Property::factory()->draft()->create(['title' => 'Kirana Villa Canggu']);

    $this->get(route('admin.properties.index'))
        ->assertOk()
        ->assertSee('Publish')
        ->assertDontSee('Unpublish');
});
