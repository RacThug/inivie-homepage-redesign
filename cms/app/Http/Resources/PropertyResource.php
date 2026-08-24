<?php

namespace App\Http\Resources;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The public shape of a property, defined once here and mirrored in
 * `web/src/types/property.ts`. Both change in the same commit, and
 * docs/API-SPEC.md ch. 3.3 is the authority on what belongs.
 *
 * Everything absent from this list is absent on purpose. `is_published`,
 * `published_at`, `image_path` and the lifecycle timestamps are internal
 * state, and P4 keeps the payload to what a card actually renders.
 *
 * @mixin Property
 */
class PropertyResource extends JsonResource
{
    /**
     * Every key is unconditional. P8: a field is either always populated
     * or explicitly null, never conditionally absent, because an absent
     * key and a null one are indistinguishable to a consumer until one
     * of them is not.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'category' => $this->category->value,
            'location' => $this->location,
            'excerpt' => $this->excerpt,
            // Derived by the model, which is the seam's single derivation
            // point (TECHNICAL-DESIGN ch. 5.5). The admin renders the same
            // image, so the conversion cannot live in this class alone.
            'image_url' => $this->imageUrl(),
            'image_alt' => $this->image_alt,
            // Which part of the photograph the card's 4:3 crop keeps. The
            // frontend cannot work this out: only the editor knows where
            // the subject of their picture is.
            'image_focus' => $this->image_focus->value,
            'price_from' => $this->price_from,
            'currency' => $this->currency,
            // The decimal:1 cast hands back a string, and the contract
            // says number. Casting here rather than loosening the model
            // cast keeps the rounding the database column guarantees.
            'rating' => $this->rating === null ? null : (float) $this->rating,
            'cta_url' => $this->cta_url,
            'sort_order' => $this->sort_order,
        ];
    }
}
