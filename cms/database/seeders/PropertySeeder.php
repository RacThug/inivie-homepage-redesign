<?php

namespace Database\Seeders;

use App\Enums\PropertyCategory;
use App\Models\Property;
use Illuminate\Database\Seeder;

/**
 * The 6 properties of docs/DATA-MODEL.md ch. 4: 4 published, 2 draft.
 *
 * The two drafts are not padding. They are the evidence that D1 works,
 * because a reviewer sees 6 rows in the CMS and exactly 4 on the homepage,
 * which proves the publish filter is real rather than assumed.
 *
 * Names are properties genuinely associated with the group, so the
 * homepage looks credible rather than filled with lorem ipsum.
 */
class PropertySeeder extends Seeder
{
    /**
     * Attributes that differ per row. Everything else comes from the
     * factory, so seed data and test data cannot drift apart.
     *
     * @var list<array<string, mixed>>
     */
    private const PROPERTIES = [
        [
            'title' => 'Leedon Villa Seminyak',
            'slug' => 'leedon-villa-seminyak',
            'category' => PropertyCategory::Villa,
            'location' => 'Seminyak, Bali',
            'excerpt' => 'A walled garden villa two streets back from Petitenget beach, with a private pool and a full kitchen.',
            'image_alt' => 'The private pool and garden terrace at Leedon Villa Seminyak.',
            'price_from' => 3_200_000,
            'rating' => 4.8,
            'sort_order' => 10,
            'published' => true,
        ],
        [
            'title' => 'Ajowa Resort',
            'slug' => 'ajowa-resort',
            'category' => PropertyCategory::Resort,
            'location' => 'Nusa Dua, Bali',
            'excerpt' => 'Sixty rooms around a central lagoon pool, a short walk from the calm water of the southern reef.',
            'image_alt' => 'The lagoon pool at Ajowa Resort seen from the terrace.',
            'price_from' => 2_400_000,
            'rating' => 4.6,
            'sort_order' => 20,
            'published' => true,
        ],
        [
            'title' => 'La Mewali Resort',
            'slug' => 'la-mewali-resort',
            'category' => PropertyCategory::Resort,
            'location' => 'Uluwatu, Bali',
            'excerpt' => 'Cliffside suites above the break at Bingin, with an open air restaurant facing the sunset.',
            'image_alt' => 'Cliffside suites at La Mewali Resort overlooking the ocean.',
            'price_from' => 4_100_000,
            'rating' => 4.9,
            'sort_order' => 30,
            'published' => true,
        ],
        [
            'title' => 'Astera Canggu',
            'slug' => 'astera-canggu',
            'category' => PropertyCategory::Hotel,
            'location' => 'Canggu, Bali',
            'excerpt' => 'A compact design hotel on Batu Bolong, built around a courtyard cafe and a rooftop pool.',
            'image_alt' => 'The rooftop pool at Astera Canggu at golden hour.',
            'price_from' => 1_800_000,
            'rating' => 4.5,
            'sort_order' => 40,
            'published' => true,
        ],
        [
            'title' => 'Seascape Sanur',
            'slug' => 'seascape-sanur',
            'category' => PropertyCategory::Resort,
            'location' => 'Sanur, Bali',
            'excerpt' => 'Low rise pavilions opening straight onto the Sanur boardwalk, with a sunrise facing beach club.',
            'image_alt' => 'Beachfront pavilions at Seascape Sanur at sunrise.',
            'price_from' => 2_900_000,
            'rating' => null,
            'sort_order' => 50,
            'published' => false,
        ],
        [
            'title' => 'Svaha Retreat Ubud',
            'slug' => 'svaha-retreat-ubud',
            'category' => PropertyCategory::Villa,
            'location' => 'Ubud, Bali',
            'excerpt' => 'Eight villas terraced into the Petanu river valley, each with an outdoor bath over the gorge.',
            'image_alt' => 'A villa terrace at Svaha Retreat Ubud above the river valley.',
            'price_from' => null,
            'rating' => null,
            'sort_order' => 60,
            'published' => false,
        ],
    ];

    /**
     * Keyed on `slug` so re-seeding updates the 6 rows rather than
     * duplicating them, and so a soft deleted row is revived rather than
     * colliding with the unique constraint of D4.
     */
    public function run(): void
    {
        foreach (self::PROPERTIES as $row) {
            $published = $row['published'];
            unset($row['published']);

            $row['cta_url'] = "https://inivie.com/properties/{$row['slug']}";
            $row['image_path'] = "properties/{$row['slug']}.webp";

            $attributes = Property::factory()
                ->{$published ? 'published' : 'draft'}()
                ->raw($row);

            $property = Property::withTrashed()->firstOrNew(['slug' => $row['slug']]);
            $property->fill($attributes);
            // Assigned directly rather than through fill(), because
            // deleted_at is deliberately absent from $fillable.
            $property->deleted_at = null;
            $property->save();
        }
    }
}
