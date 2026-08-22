{{--
    Paging for the index, in the admin's own vocabulary rather than
    Laravel's default pagination view, which is written in another design
    system's classes and would arrive with shadows and a blue focus ring.

    Rendered only when there is more than one page. A pager under a list that
    fits on one screen is a control that never does anything.
--}}
@if ($properties->hasPages())
    <nav class="mt-4 flex items-center justify-between gap-4" aria-label="Pagination">
        <p class="text-[13px] leading-[18px] text-ink-muted tabular-nums">
            {{ $properties->firstItem() }}-{{ $properties->lastItem() }} of {{ $properties->total() }}
        </p>

        <div class="flex items-center gap-2">
            {{-- A disabled control keeps its place in the layout rather than
                 disappearing, so the pair does not shift sideways between
                 the first page and the second. ch. 6.3 in full: `muted` text
                 on `border`, no pointer events, and the treatment replaces
                 the variant rather than layering over it. --}}
            @if ($properties->onFirstPage())
                <span class="btn pointer-events-none bg-border text-muted" aria-disabled="true">Previous</span>
            @else
                <a href="{{ $properties->previousPageUrl() }}" rel="prev" class="btn btn-secondary">Previous</a>
            @endif

            @if ($properties->hasMorePages())
                <a href="{{ $properties->nextPageUrl() }}" rel="next" class="btn btn-secondary">Next</a>
            @else
                <span class="btn pointer-events-none bg-border text-muted" aria-disabled="true">Next</span>
            @endif
        </div>
    </nav>
@endif
