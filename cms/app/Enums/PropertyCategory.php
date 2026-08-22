<?php

namespace App\Enums;

/**
 * The allowed values of `properties.category`.
 *
 * Defined here once and referenced by both the migration and the model
 * cast, so the allowed set cannot drift between the schema and the
 * application. See docs/DATA-MODEL.md ch. 5.
 */
enum PropertyCategory: string
{
    case Resort = 'resort';
    case Villa = 'villa';
    case Hotel = 'hotel';

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
