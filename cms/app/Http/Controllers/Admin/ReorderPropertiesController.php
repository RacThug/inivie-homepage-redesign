<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderPropertiesRequest;
use App\Models\Property;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

/**
 * Capability C7 and requirement F2: the homepage card order is an editorial
 * decision made here, not insertion order.
 *
 * The index edits the order column inline and submits every row it is
 * showing at once, per docs/TECHNICAL-DESIGN.md ch. 5.6. The batch is
 * applied inside a transaction, so a failure part way through leaves the
 * previous order intact rather than a running order nobody chose.
 */
class ReorderPropertiesController extends Controller
{
    public function __invoke(ReorderPropertiesRequest $request): RedirectResponse
    {
        /** @var array<int, int> $order */
        $order = $request->validated('order');

        DB::transaction(function () use ($order): void {
            // One query for the set, then a save per row that actually
            // moved: Eloquent issues no statement for a model that is not
            // dirty, so an admin who changed one box writes one row.
            //
            // Saved through the model rather than as a mass update so that
            // the record's own rules keep applying. A query builder update
            // is the shape that quietly skips them, and the next column
            // with an invariant is the one that finds out.
            Property::whereKey(array_keys($order))
                ->get()
                ->each(fn (Property $property) => $property->update([
                    'sort_order' => $order[$property->id],
                ]));
        });

        return back(fallback: route('admin.properties.index'))
            ->with('status', 'The homepage order has been saved.');
    }
}
