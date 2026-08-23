<?php

use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/*
| The callback of docs/API-SPEC.md ch. 5.2 and the strategy of
| docs/TECHNICAL-DESIGN.md ch. 3.3, which together are the second half of
| acceptance criterion 9.4: an edit made in the panel reaches the homepage
| without waiting out the 60 second cache window.
|
| Two things are being tested and they pull in opposite directions. That
| every admin action fires the call is the feature. That no admin action can
| ever fail because of it is the constraint, and it is the one worth more:
| a stale homepage costs a minute, a save that refuses to complete costs an
| editor their work.
*/

const REVALIDATE_SECRET = 'test-revalidate-secret';
const REVALIDATE_ENDPOINT = 'http://localhost:3000/api/revalidate';

beforeEach(function () {
    $this->actingAs(User::factory()->create());

    // Off by default across the suite, per the pin in phpunit.xml, so the
    // cases that are about the callback switch it on for themselves.
    config(['services.frontend.revalidate_secret' => REVALIDATE_SECRET]);
});

/**
 * A frontend that accepts everything, for the cases that are about whether
 * the call is made rather than about what comes back. Calling it again
 * inside a test also clears the recorded calls, which is how a case forgets
 * the revalidation its own fixtures caused before acting.
 *
 * Not in the outer `beforeEach`: `Http::fake()` appends to the stub list
 * rather than replacing it, and the first stub that matches wins, so a
 * blanket 200 registered there would quietly shadow the 401 the failure
 * cases set up for themselves.
 */
function fakeWorkingFrontend(): void
{
    Http::fake();
}

/**
 * Whether the frontend was asked to drop the properties tag, in the shape
 * ch. 5.2 documents: the endpoint, the secret header, and the tag.
 */
function assertRevalidated(int $times = 1): void
{
    Http::assertSentCount($times);

    Http::assertSent(fn (Request $request) => $request->url() === REVALIDATE_ENDPOINT
        && $request->method() === 'POST'
        && $request->hasHeader('X-Revalidate-Secret', REVALIDATE_SECRET)
        && $request['tag'] === 'properties');
}

describe('the five actions that change the homepage', function () {
    beforeEach(fn () => fakeWorkingFrontend());

    it('revalidates after a property is created', function () {
        Storage::fake(config('filesystems.default'));

        $this->post(route('admin.properties.store'), propertyForm())
            ->assertRedirect(route('admin.properties.index'));

        assertRevalidated();
    });

    it('revalidates after a property is edited', function () {
        $property = Property::factory()->create();
        fakeWorkingFrontend();

        $this->put(route('admin.properties.update', $property), propertyForm([
            'slug' => $property->slug,
            'image' => null,
        ]))->assertRedirect(route('admin.properties.index'));

        assertRevalidated();
    });

    it('revalidates after a property is deleted', function () {
        $property = Property::factory()->create();
        fakeWorkingFrontend();

        $this->delete(route('admin.properties.destroy', $property))
            ->assertRedirect(route('admin.properties.index'));

        assertRevalidated();
    });

    it('revalidates after the publish toggle', function () {
        $property = Property::factory()->create(['is_published' => false]);
        fakeWorkingFrontend();

        $this->patch(route('admin.properties.publish', $property), ['publish' => '1'])
            ->assertRedirect();

        assertRevalidated();
    });

    it('revalidates once for a reorder, however many rows moved', function () {
        // The batch is one editorial decision and one transaction (ch. 5.6),
        // so it is one tag drop. Without coalescing this is a POST per row.
        $properties = Property::factory()->count(5)->create();
        fakeWorkingFrontend();

        $this->post(route('admin.properties.reorder'), [
            'order' => $properties->mapWithKeys(
                fn (Property $property, int $index) => [$property->id => ($index + 1) * 10]
            )->all(),
        ])->assertRedirect();

        assertRevalidated();
    });
});

describe('when it fires', function () {
    beforeEach(fn () => fakeWorkingFrontend());

    it('waits for the transaction to commit', function () {
        // Revalidating mid-transaction would have the frontend re-read the
        // rows as they were before the write and cache those for another
        // minute, which is worse than not revalidating at all.
        DB::transaction(function () {
            Property::factory()->create();

            Http::assertNothingSent();
        });

        assertRevalidated();
    });

    it('leaves nothing queued, so the next operation revalidates too', function () {
        Property::factory()->create();
        Property::factory()->create();

        Http::assertSentCount(2);
    });

    it('collapses a force delete into one call', function () {
        $property = Property::factory()->create();
        fakeWorkingFrontend();

        // A force delete fires both `deleted` and `forceDeleted`.
        $property->forceDelete();

        assertRevalidated();
    });

    it('fires for a write that never went near the panel', function () {
        // A Tinker session or a future bulk import makes the homepage just
        // as stale as the edit form does, which is why this hangs off the
        // record rather than off five controller actions.
        Property::factory()->create()->update(['title' => 'Renamed elsewhere']);

        Http::assertSentCount(2);
    });
});

describe('when it is switched off', function () {
    beforeEach(fn () => fakeWorkingFrontend());

    it('sends nothing without a secret', function () {
        config(['services.frontend.revalidate_secret' => null]);

        Property::factory()->create();

        Http::assertNothingSent();
    });

    it('sends nothing without a frontend to call', function () {
        config(['services.frontend.internal_url' => null]);

        Property::factory()->create();

        Http::assertNothingSent();
    });
});

describe('when the frontend does not cooperate', function () {
    it('logs a refusal and lets the save stand', function () {
        Log::spy();
        Http::fake(['*' => Http::response(['revalidated' => false], 401)]);
        Storage::fake(config('filesystems.default'));

        $this->post(route('admin.properties.store'), propertyForm())
            ->assertRedirect(route('admin.properties.index'))
            ->assertSessionHas('status');

        expect(Property::count())->toBe(1);

        Log::shouldHaveReceived('warning')
            ->withArgs(fn (string $message, array $context = []) => str_contains($message, REVALIDATE_ENDPOINT)
                && str_contains($message, 'answered 401'))
            ->once();
    });

    it('logs an unreachable frontend and lets the save stand', function () {
        Log::spy();
        Http::fake(fn () => throw new ConnectionException('Connection refused'));

        $property = Property::factory()->create();

        expect($property->exists)->toBeTrue();

        Log::shouldHaveReceived('warning')
            ->withArgs(fn (string $message, array $context = []) => str_contains($message, 'could not be reached'))
            ->once();
    });
});
