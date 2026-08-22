<?php

namespace App\Observers;

use App\Models\Property;

class PropertyObserver
{
    /**
     * Domain rule D6.
     *
     * `published_at` records when a property first went live, so it is a
     * historical fact rather than a mirror of current state. It is stamped
     * the first time a row is saved in a published state and never written
     * again, which is what makes unpublishing non destructive. Current
     * visibility is what `is_published` is for. See DATA-MODEL ch. 3.1.
     */
    public function saving(Property $property): void
    {
        if ($property->is_published && $property->published_at === null) {
            $property->published_at = $property->freshTimestamp();
        }
    }
}
