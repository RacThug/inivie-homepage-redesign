{{--
    The 56 by 42 thumbnail of docs/DESIGN-SYSTEM.md ch. 8.5, at the 8px
    control radius rather than the 12px card radius: 12px on a 42px tall
    image reads as a squircle instead of a photograph.

    Shared by the data table and the stacked list below 640px, which are two
    renderings of the same row and must not disagree about the picture in it.

    The alt text is the property's own, never empty and never "thumbnail":
    `image_alt` is not nullable precisely so that a listing cannot exist
    without a description of its photograph.
--}}
@props(['property'])

<img
    src="{{ $property->imageUrl() }}"
    alt="{{ $property->image_alt }}"
    width="56"
    height="42"
    loading="lazy"
    {{ $attributes->class('h-[42px] w-14 rounded-control border border-border object-cover') }}
>
