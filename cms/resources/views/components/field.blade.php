{{--
    The form field of docs/DESIGN-SYSTEM.md ch. 8.5: label above the control,
    the message directly below it, and the help text in the same slot as the
    message rather than stacked with it.

    C8 lives here. Every property form field renders through this component,
    so "errors are shown per field with the submitted values preserved" is one
    implementation rather than twelve, and a field cannot be added later that
    quietly forgets to show its own error.

    Every control type the panel needs is rendered here rather than passed in
    as markup. The four of them differ by one tag and nothing else, and the
    part that matters is shared: `aria-invalid` drives both the CSS border and
    what assistive technology announces, and `aria-describedby` has to point
    at whichever of the two paragraphs below actually exists. Left to each
    caller, that pairing is one that a field written next month gets subtly
    wrong, and nothing fails when it does.
--}}
@props([
    'name',
    'label',
    'type' => 'text',
    'value' => null,
    'help' => null,
    'required' => false,
    'options' => [],
    'prompt' => null,
])

@php
    $invalid = $errors->has($name);

    // The message replaces the help text rather than joining it, per ch. 8.5,
    // so only one of the two is ever announced.
    $described = $invalid ? "{$name}-error" : ($help ? "{$name}-help" : null);

    $control = array_filter([
        'id' => $name,
        'name' => $name,
        'aria-invalid' => $invalid ? 'true' : 'false',
        'aria-describedby' => $described,
        'required' => $required ? 'required' : null,
    ]);
@endphp

<div class="flex flex-col gap-1.5">
    <label for="{{ $name }}" class="text-[13px] leading-[18px] font-medium">
        {{ $label }}
        @unless ($required)
            <span class="font-normal text-ink-muted">(optional)</span>
        @endunless
    </label>

    @if ($type === 'select')
        <select {{ $attributes->class('field-control')->merge($control) }}>
            @if ($prompt)
                <option value="">{{ $prompt }}</option>
            @endif

            @foreach ($options as $optionValue => $optionLabel)
                <option value="{{ $optionValue }}" @selected((string) $value === (string) $optionValue)>
                    {{ $optionLabel }}
                </option>
            @endforeach
        </select>
    @elseif ($type === 'textarea')
        <textarea {{ $attributes->class('field-control')->merge($control) }}>{{ $value }}</textarea>
    @elseif ($type === 'file')
        {{-- A browser will not let a file input be repopulated, which is the
             single exception to the preserved values in C8 and not one any
             application can close. --}}
        <input
            type="file"
            {{ $attributes->class('field-control h-auto py-2 file:mr-3 file:rounded-control file:border-0 file:bg-surface-alt file:px-3 file:py-1 file:text-sm file:font-medium file:text-ink')->merge($control) }}
        >
    @else
        <input type="{{ $type }}" value="{{ $value }}" {{ $attributes->class('field-control')->merge($control) }}>
    @endif

    @error($name)
        <p id="{{ $name }}-error" class="text-[13px] leading-[18px] text-danger">{{ $message }}</p>
    @else
        @if ($help)
            <p id="{{ $name }}-help" class="text-[13px] leading-[18px] text-ink-muted">{{ $help }}</p>
        @endif
    @enderror
</div>
