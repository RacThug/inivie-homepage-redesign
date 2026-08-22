<?php

namespace Database\Factories;

use App\Enums\PropertyCategory;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Backs both the test suite and the seeder, so seed data and test data
 * cannot drift apart. See docs/DATA-MODEL.md ch. 4.
 *
 * @extends Factory<Property>
 */
class PropertyFactory extends Factory
{
    protected $model = Property::class;

    /**
     * A draft by default, matching the schema default. Publishing is a
     * deliberate act, so a test has to ask for it.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $category = fake()->randomElement(PropertyCategory::cases());
        $area = fake()->randomElement([
            'Seminyak', 'Canggu', 'Ubud', 'Sanur', 'Uluwatu', 'Nusa Dua',
        ]);
        $title = fake()->unique()->lastName().' '.$category->label().' '.$area;
        $slug = Str::slug($title);

        return [
            'title' => $title,
            'slug' => $slug,
            'category' => $category,
            'location' => $area.', Bali',
            'excerpt' => fake()->sentence(12),
            'image_path' => "properties/{$slug}.webp",
            'image_alt' => "The pool terrace at {$title} at dusk.",
            // Whole rupiah. See DATA-MODEL ch. 2.1 on why this is an integer.
            'price_from' => fake()->numberBetween(15, 120) * 100_000,
            'currency' => 'IDR',
            'rating' => fake()->randomFloat(1, 3.5, 5.0),
            'cta_url' => "https://inivie.com/properties/{$slug}",
            'sort_order' => 0,
            'is_published' => false,
            'published_at' => null,
        ];
    }

    /**
     * Published, and stamped as such.
     *
     * The stamp is set here rather than left to the observer because
     * DatabaseSeeder uses WithoutModelEvents, which wraps its whole run
     * in Model::withoutEvents(). Seeders called from inside it are muted
     * too, so an observer written stamp would never fire during seeding.
     * Verified: 0 observer calls across a full seed on 22 August 2026.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'published_at' => now(),
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
            'published_at' => null,
        ]);
    }
}
