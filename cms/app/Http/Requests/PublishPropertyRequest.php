<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The row level publish action of capability C6.
 *
 * One field, and it is the reason the action is a form rather than a link:
 * the submission states the state it wants instead of asking the server to
 * flip whatever it finds. A blind toggle turns a double click, a stale tab,
 * or a replayed request into the opposite of what the admin asked for, and
 * the only evidence is a property that is live when it should not be.
 */
class PublishPropertyRequest extends FormRequest
{
    /**
     * The `auth` middleware on the route group is the whole authorisation
     * story: one role, and an admin may publish any property.
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
        // `required` rather than defaulting to false. An absent field is a
        // form that has gone wrong, and unpublishing on the way past would
        // hide a property nobody asked to hide.
        return [
            'publish' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'publish.required' => 'That action did not say whether the property should be live. Reload the page and try again.',
        ];
    }
}
