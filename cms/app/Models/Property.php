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
use Illuminate\Support\Facades\Storage;

/**
 * A property shown in the homepage's Featured Properties section.
 *
 * @property-read int $id
 */
#[ObservedBy(PropertyObserver::class)]
class Property extends Model
{
    /**
     * The ceiling of the `sort_order` column, which DATA-MODEL ch. 1
     * declares as a `smallint unsigned`.
     *
     * Named here because two form requests validate against it, and a
     * literal in each is a literal that outlives the next column change.
     * A position above it is not a rounding error: MySQL either rejects the
     * write or, outside strict mode, silently stores the maximum, and the
     * admin is told the order saved.
     */
    public const MAX_SORT_ORDER = 65535;

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
     * The one place a stored relative path becomes a URL, per the storage
     * seam in docs/TECHNICAL-DESIGN.md ch. 5.5. `Storage::url()` asks the
     * configured disk, so moving to object storage stays a config change.
     *
     * It sits on the model rather than in `PropertyResource` because the
     * admin renders the same image in its index thumbnail and its edit
     * preview. A second derivation for the panel would be a second place to
     * fix, which is the outcome the seam exists to prevent.
     *
     * The `url()` wrap makes P6's absolute URL true for every disk: the
     * local driver returns a root relative path, which next/image refuses.
     * `url()` leaves an already absolute URL untouched.
     */
    public function imageUrl(): string
    {
        return url(Storage::url($this->image_path));
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
     * The complement of `published`, for the admin dashboard counts.
     *
     * Stated as its own scope rather than negated at the call site so the
     * pair reads as the partition it is. Soft deleted rows fall outside both,
     * which is correct: a deleted property is neither published nor waiting
     * to be.
     *
     * @param  Builder<Property>  $query
     * @return Builder<Property>
     */
    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('is_published', false);
    }

    /**
     * The optional `category` filter of the public endpoint. A null
     * category is the absence of the parameter, not a category, so it
     * narrows nothing and the caller needs no conditional.
     *
     * @param  Builder<Property>  $query
     * @return Builder<Property>
     */
    public function scopeInCategory(Builder $query, ?PropertyCategory $category): Builder
    {
        return $query->when(
            $category,
            fn (Builder $query, PropertyCategory $category) => $query->where('category', $category),
        );
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
