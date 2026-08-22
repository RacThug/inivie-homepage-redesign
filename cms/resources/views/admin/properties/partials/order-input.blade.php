{{--
    The inline position of capability C7, one per row.

    The input belongs to the reorder form in `reorder-bar`, not to any form
    it is nested in, which is what the `form` attribute states. The row also
    carries a publish form and a delete form, and a form cannot contain a
    form: associating by id is what lets one submission gather a position
    from every row while the row keeps its own actions.

    The label is visible below 640px and read only above it. The column
    header names the box on a table, and there is no column header once the
    table becomes a stacked list, so the label has to be somewhere. The
    property's title is announced either way, because "Order" repeated
    twenty times names nothing.
--}}
@use('App\Models\Property')

@php
    $field = "order.{$property->id}";
    $invalid = $errors->has($field);
@endphp

<div class="flex items-center gap-2">
    <label
        for="order-{{ $property->id }}"
        class="shrink-0 text-[13px] leading-[18px] text-ink-muted sm:sr-only"
    >
        Order<span class="sr-only">, {{ $property->title }}</span>
    </label>

    <input
        type="number"
        id="order-{{ $property->id }}"
        name="order[{{ $property->id }}]"
        form="reorder"
        value="{{ old($field, $property->sort_order) }}"
        min="0"
        max="{{ Property::MAX_SORT_ORDER }}"
        step="1"
        inputmode="numeric"
        aria-invalid="{{ $invalid ? 'true' : 'false' }}"
        @if ($invalid) aria-describedby="order-{{ $property->id }}-error" @endif
        class="field-control h-9 w-[4.5rem] px-2 tabular-nums"
    >
</div>

@if ($invalid)
    {{-- ch. 8.5 again: the message sits directly below its control, in
         `danger` at label size, and the border it pairs with comes from
         `aria-invalid` rather than from a second class. --}}
    <p id="order-{{ $property->id }}-error" class="mt-1 text-[13px] leading-[18px] text-danger">
        {{ $errors->first($field) }}
    </p>
@endif
