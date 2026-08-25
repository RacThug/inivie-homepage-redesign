<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drops `image_focus` again, per docs/DATA-MODEL.md ch. 2.
 *
 * The column existed to anchor a 4:3 crop the card no longer performs. The
 * card now contains the whole photograph inside its box instead of covering
 * it, so nothing is cut off and there is no longer an end to keep. A column
 * whose only reader has stopped asking is one the editor is still made to
 * answer, which is the cost this removes.
 *
 * A drop migration rather than a deletion of the migration that added it:
 * that one has run on machines holding rows, and rewriting history there
 * leaves a schema the code does not match and nothing to say so. The values
 * are not preserved on the way out, because there is nothing left to read
 * them; `down()` restores the column at its old default, which is what every
 * row carried before an editor could say otherwise.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('image_focus');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->enum('image_focus', ['top', 'center', 'bottom'])
                ->default('center')
                ->after('image_alt');
        });
    }
};
