<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

/**
 * Creating a property. The rules live in the shared parent; the two that
 * are specific to a create live here.
 */
class StorePropertyRequest extends PropertyRequest
{
    /**
     * Required, because `properties.image_path` is not nullable and a card
     * without an image is not a card. The mime list, the 2 MB cap, and the
     * minimum dimensions are ch. 5.3, and they are the whole of the upload
     * defence: there is no server side resizing, so what is accepted here
     * is what the homepage renders.
     *
     * @return array<int, mixed>
     */
    protected function imageRules(): array
    {
        return [
            'required',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:2048',
            'dimensions:min_width=800,min_height=600',
        ];
    }

    /**
     * Written against the table rather than the model on purpose: an
     * Eloquent query would apply the SoftDeletes scope and let a new
     * property take the slug of a deleted one, which is exactly the
     * collision on restore that D4 exists to prevent.
     */
    protected function slugIsUnique(): Rule|string
    {
        return Rule::unique('properties', 'slug');
    }
}
