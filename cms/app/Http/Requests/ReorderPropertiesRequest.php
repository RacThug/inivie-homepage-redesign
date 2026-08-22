<?php

namespace App\Http\Requests;

use App\Models\Property;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

/**
 * The batch behind capability C7, specified in docs/TECHNICAL-DESIGN.md
 * ch. 5.6: the index submits a position for every row it is showing, as
 * `order[{id}] = {position}`, and the controller applies the lot inside one
 * transaction.
 *
 * The submission is a statement about a list, so it is accepted or refused
 * whole. Applying the part of it that still resolves would save a running
 * order the admin never saw, which is the failure a transaction exists to
 * prevent and which validation has to prevent first: a row whose id no
 * longer resolves is not a database error, so nothing downstream would
 * notice it.
 */
class ReorderPropertiesRequest extends FormRequest
{
    /**
     * The `auth` middleware on the route group is the whole authorisation
     * story: one role, and an admin may reorder any property.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'order' => ['required', 'array', 'min:1'],
            // The ceiling is the column's, not a preference. Without it the
            // write reaches MySQL and comes back either as a 500 or, on a
            // server that is not in strict mode, as a value silently
            // truncated to the maximum.
            'order.*' => ['required', 'integer', 'min:0', 'max:'.Property::MAX_SORT_ORDER],
        ];
    }

    /**
     * Every id in the submission has to name a property that is still there.
     *
     * Written as an after hook rather than as a rule because the ids arrive
     * as array *keys*, which `exists` cannot reach. One query resolves the
     * whole set: a rule per key would be a query per row.
     *
     * The keys are checked for shape before they reach the query. A key that
     * is not an integer is not a property id, and handing it to the database
     * to find out is how a comparison against a non numeric string turns
     * into either an error or an accidental match.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var array<array-key, mixed> $order */
                $order = (array) $this->input('order', []);

                $ids = array_keys($order);
                $usable = array_filter($ids, fn (mixed $id) => is_int($id) && $id >= 1);

                $found = $usable === []
                    ? 0
                    : Property::whereKey($usable)->count();

                if ($found === count($ids)) {
                    return;
                }

                $validator->errors()->add(
                    'order',
                    'This list is out of date, so nothing was reordered. Reload the page and try again.',
                );
            },
        ];
    }

    /**
     * The default humanisation names the field `order.14`, which is an
     * internal id in front of an admin who is looking at a table of titles.
     * Each message is about the box the admin typed in, and the box is
     * where it is rendered.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'order.required' => 'There was nothing to reorder.',
            'order.*.required' => 'Enter a position.',
            'order.*.integer' => 'Use a whole number.',
            'order.*.min' => 'Use zero or more.',
            'order.*.max' => 'Use '.Property::MAX_SORT_ORDER.' or less.',
        ];
    }
}
