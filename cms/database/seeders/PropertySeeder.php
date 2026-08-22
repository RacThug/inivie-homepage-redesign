<?php

namespace Database\Seeders;

use App\Enums\PropertyCategory;
use App\Models\Property;
use Illuminate\Database\Seeder;

/**
 * The 6 properties of docs/DATA-MODEL.md ch. 4: 4 published, 2 draft.
 */
class PropertySeeder extends Seeder
{
    /**
     * Everything ch. 4 pins down. Anything absent here is supplied by the
     * factory, so seed data and test data cannot drift apart.
     *
     * Derived columns are written out rather than computed, because the
     * factory derives them from a generated slug and would otherwise
     * disagree with the slug named here.
     *
     * @var list<array<string, mixed>>
     */
    private const PROPERTIES = [
        [
            'title' => 'Leedon Villa Seminyak',
            'slug' => 'leedon-villa-seminyak',
            'image_path' => 'properties/leedon-villa-seminyak.webp',
            'cta_url' => 'https://inivie.com/properties/leedon-villa-seminyak',
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
            'image_path' => 'properties/ajowa-resort.webp',
            'cta_url' => 'https://inivie.com/properties/ajowa-resort',
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
            'image_path' => 'properties/la-mewali-resort.webp',
            'cta_url' => 'https://inivie.com/properties/la-mewali-resort',
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
            'image_path' => 'properties/astera-canggu.webp',
            'cta_url' => 'https://inivie.com/properties/astera-canggu',
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
            'image_path' => 'properties/seascape-sanur.webp',
            'cta_url' => 'https://inivie.com/properties/seascape-sanur',
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
            'image_path' => 'properties/svaha-retreat-ubud.webp',
            'cta_url' => 'https://inivie.com/properties/svaha-retreat-ubud',
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
     * Keyed on `slug` so re-seeding refreshes the 6 rows rather than
     * duplicating them, and so a soft deleted row is matched rather than
     * colliding with the unique constraint of D4.
     *
     * A soft deleted row is refreshed in place and left deleted. Reviving
     * it would overrule an editor's deletion, which is the one thing D5
     * exists to make safe.
     */
    public function run(): void
    {
        foreach (self::PROPERTIES as $row) {
            $state = $row['published'] ? 'published' : 'draft';
            unset($row['published']);

            $property = Property::withTrashed()->firstOrNew(['slug' => $row['slug']]);
            $property->fill(Property::factory()->{$state}()->raw($row));
            $property->save();
        }
    }
}
