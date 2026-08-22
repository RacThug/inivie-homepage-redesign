{{--
    The two row level actions, shared by the table and by the stacked list
    below 640px so the two renderings of the same row cannot offer different
    actions.

    Each label carries the property title for assistive technology. A table of
    six identical "Edit" links is a list of six identical links to anyone
    reading them out of context.

    The delete control is a `button` rather than a submit, and the form around
    it is real: the dialog in ch. 8.5 submits it once the admin has confirmed.
    That ordering is deliberate. C5 puts deletion behind an explicit
    confirmation, so the control that cannot ask the question must not be the
    control that performs the action. With scripting unavailable this button
    does nothing at all, which is the safe half of that trade, and it is the
    same assumption the shell already makes: below 1024px the panel's own
    navigation is a scripted drawer.
--}}
<a
    href="{{ route('admin.properties.edit', $property) }}"
    class="btn btn-ghost px-2"
>
    Edit<span class="sr-only">, {{ $property->title }}</span>
</a>

<form
    method="POST"
    action="{{ route('admin.properties.destroy', $property) }}"
    data-confirm-delete
    data-subject="{{ $property->title }}"
>
    @csrf
    @method('DELETE')

    <button type="button" class="btn btn-ghost-danger px-2" data-confirm-trigger>
        Delete<span class="sr-only">, {{ $property->title }}</span>
    </button>
</form>
