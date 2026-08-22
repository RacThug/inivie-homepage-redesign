<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ListPropertiesRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * `GET /api/v1/properties`, documented in docs/API-SPEC.md ch. 3.
 */
class PropertyController extends Controller
{
    /**
     * Filtering and ordering happen here, never on the frontend (ch. 3.4),
     * so a wrong order has exactly one place to live. Each clause is a
     * model scope, which is what makes that claim checkable.
     *
     * @return AnonymousResourceCollection<int, PropertyResource>
     */
    public function __invoke(ListPropertiesRequest $request): AnonymousResourceCollection
    {
        $properties = Property::query()
            ->published()
            ->inCategory($request->category())
            ->inDisplayOrder()
            ->limit($request->limit())
            ->get();

        // P3: always an object. `meta` can grow later without that being
        // a breaking change, which a bare array would make impossible.
        return PropertyResource::collection($properties)
            ->additional(['meta' => ['count' => $properties->count()]]);
    }
}
