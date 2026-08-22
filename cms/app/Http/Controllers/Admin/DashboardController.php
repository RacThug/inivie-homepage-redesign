<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\View\View;

/**
 * The admin landing screen: how much content exists, and in what state.
 *
 * Two counts and nothing else, per docs/DESIGN-SYSTEM.md ch. 8.5 and ch. 8.8.
 * Charts and activity feeds are deliberately absent, because PRD ch. 7.2
 * defines simple as small in scope rather than unfinished.
 */
class DashboardController extends Controller
{
    public function __invoke(): View
    {
        return view('admin.dashboard', [
            // Two counts rather than one grouped query. The pair partitions
            // the table, so a group by would be marginally cheaper, but on a
            // table this size it buys nothing and reads worse.
            'publishedCount' => Property::published()->count(),
            'draftCount' => Property::draft()->count(),
        ]);
    }
}
