{{--
    The three row level actions, rendered once per row.

    Each label carries the property title for assistive technology. A table of
    six identical "Edit" links is a list of six identical links to anyone
    reading them out of context.

    The publish control is a real submit and works without scripting, because
    the question it answers is already on the button: C6 asks for a toggle,
    not for a confirmation. It posts the state it wants rather than asking the
    server to flip whatever it finds, so the same submission twice is the same
    outcome twice.

    The delete control is the opposite, and deliberately so. It is a `button`
    rather than a submit, and the form around it is real: the dialog in ch. 8.5
    submits it once the admin has confirmed. C5 puts deletion behind an
    explicit confirmation, so the control that cannot ask the question must not
    be the control that performs the action. With scripting unavailable this
    button does nothing at all, which is the safe half of that trade, and it is
    the same assumption the shell already makes: below 1024px the panel's own
    navigation is a scripted drawer.
--}}
<form method="POST" action="{{ route('admin.properties.publish', $property) }}">
    @csrf
    @method('PATCH')

    {{-- The state being asked for, not the state being left. --}}
    <input type="hidden" name="publish" value="{{ $property->is_published ? '0' : '1' }}">

    <button type="submit" class="btn btn-ghost px-2">
        {{ $property->is_published ? 'Unpublish' : 'Publish' }}<span class="sr-only">, {{ $property->title }}</span>
    </button>
</form>

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
