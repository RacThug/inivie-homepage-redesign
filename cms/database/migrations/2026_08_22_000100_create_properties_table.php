<?php

use App\Enums\PropertyCategory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The one domain table the scope needs. Column order follows the grouping
 * in docs/DATA-MODEL.md ch. 1, so the migration reads as a description of
 * the domain rather than an arbitrary list.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            // identity
            $table->id();
            $table->string('title', 120);
            $table->string('slug', 140);

            // taxonomy
            $table->enum('category', PropertyCategory::values())
                ->default(PropertyCategory::Villa->value);

            // display
            $table->string('location', 120);
            $table->string('excerpt', 240);

            // media
            $table->string('image_path', 255);
            // Not nullable on purpose: alternative text is an accessibility
            // requirement (PRD ch. 8.4), enforced at the lowest layer so an
            // editor cannot ship an inaccessible card.
            $table->string('image_alt', 160);

            // commercial
            $table->unsignedInteger('price_from')->nullable();
            $table->char('currency', 3)->default('IDR');
            $table->decimal('rating', 2, 1)->nullable();

            // linking
            $table->string('cta_url', 255)->nullable();

            // publishing
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();

            // lifecycle
            $table->timestamps();
            $table->softDeletes();

            // D4: unique across all rows including soft deleted ones, so a
            // restore can never collide with a slug taken in the meantime.
            $table->unique('slug');

            // Serves the homepage query directly. is_published is the
            // equality predicate so it comes first; sort_order supplies the
            // ordering. Reversing them would leave MySQL sorting by hand.
            $table->index(['is_published', 'sort_order']);

            // Keeps the soft delete scope cheap.
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
