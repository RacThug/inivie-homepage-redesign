<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PropertyCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Models\Property;
use App\Services\PropertyImageStore;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Throwable;

/**
 * Create, read, update, and delete for properties: capabilities C2, C3, C5
 * and C8, and the routes in docs/TECHNICAL-DESIGN.md ch. 5.2.
 *
 * The controller does four things and delegates the rest. Validation is in
 * `StorePropertyRequest` and `UpdatePropertyRequest`, never inline (ch. 5.3).
 * Files are in `PropertyImageStore`, which is the only code that touches
 * storage (ch. 5.5). The slug and the publish stamp are in
 * `PropertyObserver`, because they are true of every save, not only of the
 * ones a form makes.
 *
 * Every action that completes ends in a redirect carrying a flash message
 * that names the property, which is the second half of C8. A form that
 * silently returns to a list leaves the admin guessing whether it worked.
 */
class PropertyController extends Controller
{
    /**
     * Enough to hold the seeded set and any realistic run of a Featured
     * Properties section on one screen, and low enough that the page stays
     * a page. See the pager in docs/DESIGN-SYSTEM.md ch. 8.5.
     */
    private const PER_PAGE = 20;

    public function __construct(private readonly PropertyImageStore $images) {}

    public function index(): View
    {
        return view('admin.properties.index', [
            // The same D2 ordering the homepage gets, so the admin is
            // looking at the order the section will render in rather than
            // at insertion order. Drafts are included: this list is the
            // whole content set, not the published slice of it.
            'properties' => Property::inDisplayOrder()->paginate(self::PER_PAGE),
        ]);
    }

    public function create(): View
    {
        return view('admin.properties.create', [
            // An empty model rather than a pile of nulls, so the shared form
            // partial can read `$property->title` on both screens instead of
            // branching on which one it is rendering.
            'property' => new Property,
            'categories' => PropertyCategory::cases(),
        ]);
    }

    public function store(StorePropertyRequest $request): RedirectResponse
    {
        $attributes = $request->safe()->except('image');

        // The upload lands before the row exists, because `image_path` is
        // not nullable and there is nothing to write without it.
        $attributes['image_path'] = $this->images->store($request->file('image'));

        try {
            $property = Property::create($attributes);
        } catch (Throwable $failure) {
            // A row that was never written must not leave a file behind.
            // Without this the disk accumulates uploads that nothing points
            // at, and nothing will ever clean them up.
            $this->images->remove($attributes['image_path']);

            throw $failure;
        }

        return redirect()
            ->route('admin.properties.index')
            ->with('status', "\"{$property->title}\" has been created.");
    }

    public function edit(Property $property): View
    {
        return view('admin.properties.edit', [
            'property' => $property,
            'categories' => PropertyCategory::cases(),
        ]);
    }

    public function update(UpdatePropertyRequest $request, Property $property): RedirectResponse
    {
        $attributes = $request->safe()->except('image');

        // An absent file means the image is unchanged, per ch. 5.3, so the
        // existing `image_path` is left alone rather than overwritten with
        // a null the column would reject.
        //
        // The file it replaces is deliberately not removed here. Deleting
        // the old one only after the save succeeds, inside the transaction
        // ch. 5.4 describes, is issue #9 together with the force delete
        // cleanup. Doing half of it now would mean writing the delete twice.
        if ($request->hasFile('image')) {
            $attributes['image_path'] = $this->images->store($request->file('image'));
        }

        $property->update($attributes);

        return redirect()
            ->route('admin.properties.index')
            ->with('status', "\"{$property->title}\" has been updated.");
    }

    /**
     * D5: a soft delete. The row leaves every list and the public API, and
     * its image stays on disk, because a restore with no picture would be a
     * restore of half a property.
     */
    public function destroy(Property $property): RedirectResponse
    {
        $property->delete();

        return redirect()
            ->route('admin.properties.index')
            ->with('status', "\"{$property->title}\" has been deleted.");
    }
}
