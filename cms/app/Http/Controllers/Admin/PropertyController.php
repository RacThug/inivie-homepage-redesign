<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ImageFocus;
use App\Enums\PropertyCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Models\Property;
use App\Services\PropertyImageStore;
use Closure;
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
 * storage (ch. 5.5). The slug, the publish stamp, and the removal of a
 * replaced image are in `PropertyObserver`, because they are true of every
 * save, not only of the ones a form makes.
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
            //
            // With the column default carried on it, because a default that
            // only exists in the database is not one the create form can
            // render: the select would open on nothing and the admin would
            // have to state a focus for every photograph that wants the
            // ordinary one.
            'property' => new Property(['image_focus' => ImageFocus::Center]),
            'categories' => $this->categories(),
            'focuses' => $this->focuses(),
        ]);
    }

    public function store(StorePropertyRequest $request): RedirectResponse
    {
        $attributes = $request->safe()->except('image');

        // The upload lands before the row exists, because `image_path` is
        // not nullable and there is nothing to write without it.
        $uploaded = $this->images->store($request->file('image'));
        $attributes['image_path'] = $uploaded;

        $property = $this->writeOrDiscardUpload(
            $uploaded,
            fn () => Property::create($attributes),
        );

        return redirect()
            ->route('admin.properties.index')
            ->with('status', "\"{$property->title}\" has been created.");
    }

    public function edit(Property $property): View
    {
        return view('admin.properties.edit', [
            'property' => $property,
            'categories' => $this->categories(),
            'focuses' => $this->focuses(),
        ]);
    }

    public function update(UpdatePropertyRequest $request, Property $property): RedirectResponse
    {
        $attributes = $request->safe()->except('image');

        // An absent file means the image is unchanged, per ch. 5.3, so the
        // existing `image_path` is left alone rather than overwritten with
        // a null the column would reject.
        //
        // Removing the file this one replaces is not done here. It belongs
        // to `PropertyObserver`, which runs it once the save has committed:
        // the rule is true of the record, not of this screen, so a second
        // writer cannot forget it. See ch. 5.4.
        $uploaded = null;

        if ($request->hasFile('image')) {
            $uploaded = $this->images->store($request->file('image'));
            $attributes['image_path'] = $uploaded;
        }

        $this->writeOrDiscardUpload($uploaded, fn () => $property->update($attributes));

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

    /**
     * Perform a write that a fresh upload depends on, taking the upload back
     * down with it if the write throws.
     *
     * Both paths upload before the row that will point at the file, because
     * `image_path` is not nullable. A write that then fails would otherwise
     * leave the file on the disk with nothing referring to it and nothing
     * that will ever collect it. ch. 5.4.
     *
     * @param  Closure(): mixed  $write
     */
    private function writeOrDiscardUpload(?string $uploaded, Closure $write): mixed
    {
        try {
            return $write();
        } catch (Throwable $failure) {
            if ($uploaded !== null) {
                $this->images->remove($uploaded);
            }

            throw $failure;
        }
    }

    /**
     * The category select's options, as value to label.
     *
     * Shaped here rather than in the view, so the form partial states which
     * field it renders and nothing about how an enum becomes a list.
     *
     * @return array<string, string>
     */
    private function categories(): array
    {
        return collect(PropertyCategory::cases())
            ->mapWithKeys(fn (PropertyCategory $category) => [$category->value => $category->label()])
            ->all();
    }

    /**
     * The image focus select's options, shaped the same way and for the
     * same reason as the categories above.
     *
     * @return array<string, string>
     */
    private function focuses(): array
    {
        return collect(ImageFocus::cases())
            ->mapWithKeys(fn (ImageFocus $focus) => [$focus->value => $focus->label()])
            ->all();
    }
}
