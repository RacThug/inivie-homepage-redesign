{{--
    The two row level actions, shared by the table and by the stacked list
    below 640px so the two renderings of the same row cannot offer different
    actions.

    Each label carries the property title for assistive technology. A table
    of six identical "Edit" links is a list of six identical links to anyone
    reading them out of context.
--}}
<a
    href="{{ route('admin.properties.edit', $property) }}"
    class="btn btn-ghost px-2"
>
    Edit<span class="sr-only">, {{ $property->title }}</span>
</a>

{{--
    A real form rather than a button that only speaks to JavaScript. The
    confirm modal of ch. 8.5 intercepts the submit and replays it once the
    admin confirms, so the delete still works with scripting unavailable: it
    simply happens without the extra question.
--}}
<form
    method="POST"
    action="{{ route('admin.properties.destroy', $property) }}"
    data-confirm-delete
    data-subject="{{ $property->title }}"
>
    @csrf
    @method('DELETE')

    <button type="submit" class="btn btn-ghost-danger px-2">
        Delete<span class="sr-only">, {{ $property->title }}</span>
    </button>
</form>
