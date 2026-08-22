<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\PropertyCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * The query string of `GET /api/v1/properties`, per docs/API-SPEC.md
 * ch. 3.1.
 *
 * A form request rather than inline validation, matching
 * docs/TECHNICAL-DESIGN.md ch. 5.3, and it also gives the controller a
 * typed way to read the two parameters instead of re-reading raw input
 * that has already been checked.
 */
class ListPropertiesRequest extends FormRequest
{
    /**
     * What the Featured Properties section asks for (rule F1), so the
     * common call needs no query string at all.
     */
    public const DEFAULT_LIMIT = 3;

    /**
     * The ceiling exists so a crafted request cannot turn a public read
     * endpoint into a full table dump.
     */
    public const MAX_LIMIT = 12;

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'limit' => ['sometimes', 'integer', 'between:1,'.self::MAX_LIMIT],
            'category' => ['sometimes', Rule::enum(PropertyCategory::class)],
        ];
    }

    public function limit(): int
    {
        return $this->integer('limit', self::DEFAULT_LIMIT);
    }

    public function category(): ?PropertyCategory
    {
        return $this->enum('category', PropertyCategory::class);
    }
}
