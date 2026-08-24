<?php

use App\Enums\ImageFocus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `image_focus`, the media group's third column, per docs/DATA-MODEL.md ch. 2.
 *
 * A separate migration rather than an edit to the create: the table has been
 * migrated on machines that hold rows already, and rewriting a migration that
 * has run leaves those machines with a schema the code no longer matches and
 * nothing to tell them so.
 *
 * The default is what makes it safe on a populated table. Every existing row
 * gets `center`, which is exactly the behaviour they had before the column
 * existed, so no row changes appearance on the way through.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->enum('image_focus', ImageFocus::values())
                ->default(ImageFocus::Center->value)
                ->after('image_alt');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('image_focus');
        });
    }
};
