<?php

namespace App\Enums;

/**
 * The allowed values of `properties.image_focus`: which part of a photograph
 * survives the card's 4:3 crop.
 *
 * The homepage card is a fixed 4:3 box with `object-cover`, so a photograph
 * that is not 4:3 loses its edges. Centre is the right answer for the wide
 * shot of a pool that most property photography is, and the wrong one for a
 * portrait: the first upload an editor made in anger was a person, and the
 * middle of a portrait is a torso. This is the editor saying which end to
 * keep. See docs/DATA-MODEL.md ch. 5 and DESIGN-SYSTEM ch. 6.1.
 *
 * The three values are also the CSS keywords they mean, so the admin preview
 * can hand the stored value straight to `object-position`. The frontend maps
 * them to utilities instead, because it does not share a stylesheet with
 * this application.
 */
enum ImageFocus: string
{
    case Top = 'top';
    case Center = 'center';
    case Bottom = 'bottom';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return ucfirst($this->value);
    }
}
