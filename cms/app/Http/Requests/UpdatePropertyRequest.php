<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

/**
 * Editing a property. The rules live in the shared parent; the two that
 * are specific to an update live here.
 */
class UpdatePropertyRequest extends PropertyRequest
{
    /**
     * Optional. An edit that fixes a typo in the excerpt should not make
     * the admin re-pick a file that has not changed. When one is supplied
     * it faces exactly the create rules, so a replacement cannot be held to
     * a lower standard than the original.
     *
     * @return array<int, mixed>
     */
    protected function imageRules(): array
    {
        return [
            'nullable',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:2048',
            'dimensions:min_width=800,min_height=600',
        ];
    }

    /**
     * Unique among every other property, soft deleted ones included, but
     * not against the record being edited: saving a form without touching
     * the slug must not report the property its own slug as taken.
     */
    protected function slugIsUnique(): Rule|string
    {
        return Rule::unique('properties', 'slug')->ignore($this->route('property'));
    }
}
