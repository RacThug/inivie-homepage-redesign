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
     * Domain rules D1 and D2: the homepage shows published, undeleted rows
     * in `sort_order` ascending, newest first within a tie.
     *
     * Soft deleted rows are excluded by the SoftDeletes global scope, so
     * this scope only has to state the publishing half of D1.
     *
     * @param  Builder<Property>  $query
     * @return Builder<Property>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderByDesc('created_at');
    }
}
