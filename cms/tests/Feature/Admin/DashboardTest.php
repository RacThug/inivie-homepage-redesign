<?php

use App\Models\Property;
use App\Models\User;

/*
| The dashboard counts of issue #7 and docs/DESIGN-SYSTEM.md ch. 8.5.
*/

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('counts published and draft properties separately', function () {
    Property::factory()->count(4)->published()->create();
    Property::factory()->count(2)->draft()->create();

    $this->get('/admin')
        ->assertOk()
        ->assertViewHas('publishedCount', 4)
        ->assertViewHas('draftCount', 2);
});

it('counts a soft deleted property as neither', function () {
    // Domain rule D5. A deleted property is not published, and it is not
    // waiting to be published either, so it belongs in neither tile.
    Property::factory()->published()->create();
    Property::factory()->published()->create()->delete();
    Property::factory()->draft()->create()->delete();

    $this->get('/admin')
        ->assertViewHas('publishedCount', 1)
        ->assertViewHas('draftCount', 0);
});

it('renders a zero rather than hiding the tile', function () {
    // An empty state is for a list with no rows. A counter that legitimately
    // reads zero is information, not an empty state.
    $this->get('/admin')
        ->assertOk()
        ->assertSee('Published')
        ->assertSee('Draft')
        ->assertSee('0');
});
