<?php

namespace App\Observers;

use App\Models\Property;
use Illuminate\Support\Str;

/**
 * The save time invariants of a property: D4's slug and D6's publish
 * stamp. Both are documented in docs/DATA-MODEL.md ch. 2 and ch. 3.
 */
class PropertyObserver
{
    public function saving(Property $property): void
    {
        $this->fillSlugFromTitle($property);
        $this->stampFirstPublish($property);
    }

    /**
     * D4, generation half. The slug is derived from the title when the
     * editor has not supplied one, and left alone when they have, which
     * is what "manually editable" in ch. 2 means.
     *
     * Uniqueness is enforced by the database constraint. Turning a
     * collision into a readable error is a validation concern and
     * belongs to the form requests in #8.
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
