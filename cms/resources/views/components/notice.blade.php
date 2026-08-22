{{--
    The message panel of docs/DESIGN-SYSTEM.md ch. 8.5: a `surface` panel with
    a 3px left rule, `ink` for a completed action and `danger` for a failure.

    One definition, three callers: the flash beneath the page header, the
    rejected sign in on the login screen, and the summary at the top of a form
    that failed validation. They are different messages in different places
    and they are the same object, so a copy in each would be three chances for
    the treatment to drift.

    It is never dismissed on a timer, because a message that removes itself is
    a message the admin can miss.
--}}
@props(['variant' => 'status'])

@php
    $failure = $variant === 'failure';
@endphp

<div
    role="{{ $failure ? 'alert' : 'status' }}"
    {{ $attributes->class([
        'rounded-control border border-border border-l-[3px] bg-surface px-4 py-3 text-sm',
        'border-l-ink' => ! $failure,
        'border-l-danger' => $failure,
    ]) }}
>
    {{ $slot }}
</div>
