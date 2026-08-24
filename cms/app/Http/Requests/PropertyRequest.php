<?php

namespace App\Http\Requests;

use App\Enums\PropertyCategory;
use App\Models\Property;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

/**
 * The validation rules of docs/TECHNICAL-DESIGN.md ch. 5.3, which the two
 * property form requests share.
 *
 * Create and update differ in exactly two rules, so they are expressed as
 * the two hooks below rather than as two copies of a twelve row table.
 * Copies drift: the day `excerpt` grows to 320 characters, one of them gets
 * updated and the other keeps rejecting what its twin accepts.
 *
 * Nothing here is ever inline in a controller, per ch. 5.3, and C8 is what
 * the arrangement buys: a failure returns to the form with per field
 * messages and the submitted values intact.
 */
abstract class PropertyRequest extends FormRequest
{
    /**
     * The `auth` middleware on the route group is the whole authorisation
     * story: one role, and an admin may edit any property.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'alpha_dash', 'max:140', $this->slugIsUnique()],
            'category' => ['required', new Enum(PropertyCategory::class)],
            'location' => ['required', 'string', 'max:120'],
            'excerpt' => ['required', 'string', 'max:240'],
            'image' => $this->imageRules(),
            'image_alt' => ['required', 'string', 'max:160'],
            // Whole rupiah, per DATA-MODEL ch. 2.1. Optional, because a
            // property may be listed before its rate card exists.
            'price_from' => ['nullable', 'integer', 'min:0'],
            'rating' => ['nullable', 'numeric', 'between:0,5'],
            'cta_url' => ['nullable', 'url', 'max:255'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:'.Property::MAX_SORT_ORDER],
            'is_published' => ['boolean'],
        ];
    }

    /**
     * The upload rules, which differ between create and update: ch. 5.3
     * requires an image on create and leaves it optional on update, because
     * an edit that only fixes a typo should not make the admin re-pick the
     * file.
     *
     * @return array<int, mixed>
     */
    abstract protected function imageRules(): array;

    /**
     * D4, the uniqueness half. Create checks against every row; update
     * excludes the record being edited.
     */
    abstract protected function slugIsUnique(): Rule|string;

    /**
     * Two shapes the browser sends that the rules above should not have to
     * know about.
     *
     * **The slug.** DATA-MODEL ch. 2 calls it generated from the title and
     * manually editable, so the field is optional to the person filling the
     * form. Deriving it here rather than leaving it to `PropertyObserver`
     * means the value the rules see is the value that will be written, so a
     * collision comes back as a per field message instead of a unique
     * constraint violation the admin reads as a 500. The observer stays as
     * the guarantee for the paths that never touch a form, such as the
     * seeder and Tinker.
     *
     * **The checkbox.** An unchecked box is not submitted at all. Left
     * alone, `is_published` would be absent from `validated()` and an update
     * would keep the old value: the admin unpublishes a property, the form
     * reports success, and the property is still on the homepage.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => filled($this->input('slug'))
                ? $this->input('slug')
                : Str::slug((string) $this->input('title')),
            'is_published' => $this->boolean('is_published'),
        ]);
    }

    /**
     * Field names as they read in a message. Without this the default
     * humanisation gives "The cta url field must be a valid URL", and
     * `image_alt` becomes "image alt", which names nothing the admin can
     * see on screen.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'cta_url' => 'link',
            'image_alt' => 'image description',
            'price_from' => 'price',
            'sort_order' => 'order',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // The field is optional to the person filling the form, so a
            // bare "field is required" under a label marked optional would
            // read as a contradiction. It can only fire when the title is
            // empty too, and this says so.
            'slug.required' => 'The slug comes from the title, so add a title or type a slug.',
            'slug.alpha_dash' => 'The slug may only contain letters, numbers, dashes and underscores.',
            'slug.unique' => 'Another property already uses this slug.',
            'image.max' => 'The image may not be larger than 2 MB.',
        ];
    }
}
