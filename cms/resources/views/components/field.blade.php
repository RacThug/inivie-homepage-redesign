{{--
    The form field of docs/DESIGN-SYSTEM.md ch. 8.5: label above the control,
    the message directly below it, and the help text in the same slot as the
    message rather than stacked with it.

    C8 lives here. Every property form field renders through this component,
    so "errors are shown per field with the submitted values preserved" is
    one implementation rather than twelve, and a field cannot be added later
    that quietly forgets to show its own error.

    The invalid state is carried by `aria-invalid`, which both the CSS border
    rule and assistive technology read, so the two cannot disagree.
--}}
@props([
    'name',
    'label',
    'type' => 'text',
    'value' => null,
    'help' => null,
    'required' => false,
])

@php
    $invalid = $errors->has($name);
    // The message replaces the help text rather than joining it, per ch. 8.5,
    // so only one of the two is ever announced.
    $described = $invalid ? "{$name}-error" : ($help ? "{$name}-help" : null);
@endphp

<div class="flex flex-col gap-1.5">
    <label for="{{ $name }}" class="text-[13px] leading-[18px] font-medium">
        {{ $label }}
        @unless ($required)
            <span class="font-normal text-ink-muted">(optional)</span>
        @endunless
    </label>

    {{-- A slot for the controls that are not a single input: the select, the
         textarea, the file field, the checkbox. They set their own
         `aria-invalid` because only they know their markup. --}}
    @if ($slot->isNotEmpty())
        {{ $slot }}
    @else
        <input
            id="{{ $name }}"
            name="{{ $name }}"
            type="{{ $type }}"
            value="{{ $value }}"
            @if ($required) required @endif
            @if ($described) aria-describedby="{{ $described }}" @endif
            aria-invalid="{{ $invalid ? 'true' : 'false' }}"
            {{ $attributes->class('field-control') }}
        >
    @endif

    @error($name)
        <p id="{{ $name }}-error" class="text-[13px] leading-[18px] text-danger">{{ $message }}</p>
    @else
        @if ($help)
            <p id="{{ $name }}-help" class="text-[13px] leading-[18px] text-ink-muted">{{ $help }}</p>
        @endif
    @enderror
</div>
