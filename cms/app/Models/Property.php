<?php

namespace App\Models;

use App\Enums\PropertyCategory;
use App\Observers\PropertyObserver;
use Database\Factories\PropertyFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A property shown in the homepage's Featured Properties section.
 *
 * @property-read int $id
 */
#[ObservedBy(PropertyObserver::class)]
class Property extends Model
{
    /** @use HasFactory<PropertyFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * Listed explicitly rather than guarded, so adding a column is a
     * deliberate decision about whether it may be mass assigned.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'slug',
        'category',
        'location',
        'excerpt',
        'image_path',
        'image_alt',
        'price_from',
        'currency',
        'rating',
        'cta_url',
        'sort_order',
        'is_published',
        'published_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'category' => PropertyCategory::class,
            'price_from' => 'integer',
            'rating' => 'decimal:1',
            'sort_order' => 'integer',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Domain rule D1. Soft deleted rows are excluded by the SoftDeletes
     * global scope, so this only has to state the publishing half.
     *
     * Filtering and ordering are separate scopes because a caller that
     * only counts published rows should not pay for a sort it never
     * reads. The homepage query composes both.
     *
     * @param  Builder<Property>  $query
     * @return Builder<Property>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /**
     * Domain rule D2.
     *
     * @param  Builder<Property>  $query
     * @return Builder<Property>
     */
    public function scopeInDisplayOrder(Builder $query): Builder
    {
        return $query
            ->orderBy('sort_order')
            ->orderByDesc('created_at');
    }
}
