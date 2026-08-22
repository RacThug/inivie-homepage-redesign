@extends('layouts.admin')

@section('title', 'Dashboard')
@section('heading', 'Dashboard')

@section('content')
    {{--
        Two stat tiles, per docs/DESIGN-SYSTEM.md ch. 8.5. Side by side from
        640px and stacked below it.

        A count of zero renders as `0`. An empty state is for a list with no
        rows, not for a counter that legitimately reads zero.
    --}}
    <div class="grid gap-4 sm:grid-cols-2">
        <div class="panel">
            <div class="text-[13px] leading-[18px] font-medium text-ink-muted">Published</div>
            <div class="mt-1 text-[32px] leading-10 font-semibold tabular-nums">{{ $publishedCount }}</div>
        </div>

        <div class="panel">
            <div class="text-[13px] leading-[18px] font-medium text-ink-muted">Draft</div>
            <div class="mt-1 text-[32px] leading-10 font-semibold tabular-nums">{{ $draftCount }}</div>
        </div>
    </div>
@endsection
