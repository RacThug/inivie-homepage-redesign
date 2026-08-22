<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PublishPropertyRequest;
use App\Models\Property;
use Illuminate\Http\RedirectResponse;

/**
 * Capability C6: publish or unpublish from the index, without opening the
 * edit form.
 *
 * A single action on its own controller rather than a seventh method on
 * `PropertyController`, because it is a different verb on a different route
 * (docs/TECHNICAL-DESIGN.md ch. 5.2) and it renders no screen of its own.
 *
 * The stamp in D6 is not written here. `PropertyObserver` owns it, so this
 * saves the model and lets the rule that is true of every publish apply
 * itself. Writing the column alongside `is_published` would be a second
 * implementation of a rule that already has one.
 */
class PublishPropertyController extends Controller
{
    public function __invoke(PublishPropertyRequest $request, Property $property): RedirectResponse
    {
        $publish = $request->boolean('publish');

        $property->update(['is_published' => $publish]);

        // Back to the row rather than to the top of the list: the index is
        // paginated, and an admin working on page two should not be thrown
        // back to page one by every toggle. The fallback covers a request
        // that arrives without a previous URL, which `back()` would
        // otherwise answer with the site root.
        return back(fallback: route('admin.properties.index'))
            ->with('status', $this->confirmation($property, $publish));
    }

    /**
     * C8, and the point of C6 stated in the acceptance criterion's own
     * terms: the message names the property and says what changed for the
     * guest, not which column was written.
     */
    private function confirmation(Property $property, bool $publish): string
    {
        return $publish
            ? "\"{$property->title}\" is now on the homepage."
            : "\"{$property->title}\" is now a draft and no longer on the homepage.";
    }
}
