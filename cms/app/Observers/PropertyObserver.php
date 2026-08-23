<?php

namespace App\Observers;

use App\Models\Property;
use App\Services\FrontendRevalidator;
use App\Services\PropertyImageStore;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * What is true of a property on every save, whoever is saving: D4's slug,
 * D6's publish stamp, D5's file lifecycle, and the frontend cache the write
 * has just made stale. The first three are documented in docs/DATA-MODEL.md
 * ch. 2 and ch. 3, the file half in docs/TECHNICAL-DESIGN.md ch. 5.4, and the
 * revalidation in ch. 3.3.
 *
 * The file rules live here rather than in `PropertyController` because they
 * are facts about the record, not steps in one screen's flow. A bulk import,
 * a Tinker session, or the reordering screen would each otherwise have to
 * remember them, and the one that forgets leaves either an orphaned file or
 * a row pointing at nothing.
 *
 * Revalidation is here for the same reason, and for one more. The five admin
 * actions that invalidate the homepage - create, update, delete, reorder and
 * the publish toggle - are two model events between them, so this is fewer
 * call sites than the controllers, not more. And the reorder writes its batch
 * inside a transaction: a call placed in the controller is correct only for
 * as long as nobody wraps the others in one too, while `DB::afterCommit`,
 * already the discipline here, is correct either way.
 */
class PropertyObserver
{
    public function __construct(
        private readonly PropertyImageStore $images,
        private readonly FrontendRevalidator $revalidator,
    ) {}

    /**
     * Every create and every update, which is four of the five actions:
     * the publish toggle and the reorder are both saves of a column.
     *
     * Unconditional rather than filtered down to the writes that change what
     * the API answers with. Working out whether an edit to a draft is visible
     * to a guest means reimplementing the published scope here, and the cost
     * of being wrong in the generous direction is one re-render.
     */
    public function saved(Property $property): void
    {
        $this->revalidator->properties();
    }

    /**
     * The fifth. Both kinds of delete pass through here: a soft delete takes
     * the row out of the API's scope (D5), and a force delete fires this as
     * well as `forceDeleted`, which the revalidator's coalescing collapses
     * back into one call.
     */
    public function deleted(Property $property): void
    {
        $this->revalidator->properties();
    }

    public function saving(Property $property): void
    {
        $this->fillSlugFromTitle($property);
        $this->stampFirstPublish($property);
    }

    /**
     * The replaced file goes once the row that pointed at it is really gone.
     *
     * `updated` fires after the write, and `DB::afterCommit` holds the
     * deletion until the surrounding transaction commits, running it straight
     * away when there is none. Deleting any earlier is the failure ch. 5.4
     * rules out: a rollback would leave the property pointing at a file that
     * no longer exists, with nothing to restore it from.
     *
     * `getOriginal` still holds the pre-save value here. Eloquent syncs it
     * after the `saved` event, one step later.
     */
    public function updated(Property $property): void
    {
        if (! $property->wasChanged('image_path')) {
            return;
        }

        $replaced = $property->getOriginal('image_path');

        DB::afterCommit(fn () => $this->images->remove($replaced));
    }

    /**
     * D5. A soft delete keeps the file, because a restore with no picture
     * would be a restore of half a property. A force delete is the point at
     * which the row is genuinely gone, so it is the only point at which the
     * file can be.
     */
    public function forceDeleted(Property $property): void
    {
        $path = $property->image_path;

        DB::afterCommit(fn () => $this->images->remove($path));
    }

    /**
     * D4, generation half. The slug is derived from the title when the
     * editor has not supplied one, and left alone when they have, which
     * is what "manually editable" in ch. 2 means.
     *
     * Uniqueness is enforced by the database constraint. Turning a
     * collision into a readable error is a validation concern, and it
     * belongs to the form requests: see `PropertyRequest`.
     */
    private function fillSlugFromTitle(Property $property): void
    {
        if (blank($property->slug) && filled($property->title)) {
            $property->slug = Str::slug($property->title);
        }
    }

    /**
     * D6. Bound to the transition rather than to the state: the stamp is
     * written only on the save that flips is_published to true, so it
     * survives an unpublish and is never rewritten by a later edit.
     *
     * Guarding on the state alone would re-stamp a live row whose
     * published_at was cleared, silently replacing the historical fact
     * ch. 3.1 requires to be preserved with today's date.
     */
    private function stampFirstPublish(Property $property): void
    {
        $becomingPublished = $property->is_published
            && $property->isDirty('is_published');

        if ($becomingPublished && $property->published_at === null) {
            $property->published_at = $property->freshTimestamp();
        }
    }
}
