{{--
    docs/DESIGN-SYSTEM.md ch. 8.5. Published is an `ink` fill with `surface`
    text; draft is a `surface` fill with a 1px border and `ink-muted` text.

    The pair introduces no new colour, and it stays unambiguous in greyscale
    and under any colour vision deficiency, because the difference is fill
    against outline rather than green against grey.
--}}
@props(['published' => false])

<span
    @class([
        'inline-flex h-6 items-center rounded-control px-2 text-[13px] leading-[18px] font-medium',
        'bg-ink text-surface' => $published,
        'border border-border bg-surface text-ink-muted' => ! $published,
    ])
>
    {{ $published ? 'Published' : 'Draft' }}
</span>
