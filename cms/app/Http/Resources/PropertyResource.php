<?php

namespace App\Http\Resources;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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
            'image_url' => $this->imageUrl(),
            'image_alt' => $this->image_alt,
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

    /**
     * The one place a stored relative path becomes a URL, per the storage
     * seam in docs/TECHNICAL-DESIGN.md ch. 5.5. `Storage::url()` asks the
     * configured disk, so moving to object storage is a config change.
     *
     * The `url()` wrap makes P6's absolute URL true for every disk: the
     * local driver returns a root relative path, which next/image
     * refuses. `url()` leaves an already absolute URL untouched.
     */
    private function imageUrl(): string
    {
        return url(Storage::url($this->image_path));
    }
}
