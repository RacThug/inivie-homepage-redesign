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
     * without an image is not a card. The mime list and the 2 MB cap are
     * ch. 5.3, and they are the whole of the upload defence.
     *
     * There is no floor on the pixel dimensions. One was here, at 800 by
     * 600, and it is gone by decision rather than by oversight: it is an
     * unusual thing for a CMS to refuse an editor over, and the card it
     * protected is a 400px render that a small picture makes soft rather
     * than broken. What is left is that there is no server side resizing
     * either, so what is accepted here is what the homepage renders.
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
