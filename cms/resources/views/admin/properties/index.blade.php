@extends('layouts.admin')

@section('title', 'Properties')
@section('heading', 'Properties')

@section('action')
    {{-- ch. 8.7: the primary action drops below the title and goes full
         width below 640px. --}}
    <a href="{{ route('admin.properties.create') }}" class="btn btn-primary w-full sm:w-auto">
        New property
    </a>
@endsection

@section('content')
    @if ($properties->isEmpty())
        {{-- ch. 8.5. A bare empty table is never shipped: the screen says
             what is missing and offers the action that resolves it. --}}
        <div class="panel py-12 text-center">
            <p class="font-medium">No properties yet</p>
            <p class="mt-1 text-sm text-ink-muted">
                The Featured Properties section on the homepage stays hidden until one is published.
            </p>
            <a href="{{ route('admin.properties.create') }}" class="btn btn-primary mt-5">
                Add the first property
            </a>
        </div>
    @else
        {{-- Not `.panel`: the data table runs to the container edge, so the
             padding a panel carries would leave a gutter beside every row
             rule. Everything else about the container is the same. --}}
        <div class="overflow-hidden rounded-card border border-border bg-surface">
            {{-- ch. 8.5. No zebra striping, 12px vertical cell padding, and
                 the actions column right aligned and last. --}}
            <table class="hidden w-full text-sm sm:table">
                <caption class="sr-only">Properties, in the order the homepage renders them</caption>
                <thead>
                    <tr class="border-b border-border bg-surface-alt text-left text-[13px] leading-[18px] font-medium text-ink-muted">
                        <th scope="col" class="w-20 py-3 pr-3 pl-4">
                            <span class="sr-only">Image</span>
                        </th>
                        <th scope="col" class="px-3 py-3">Title</th>
                        <th scope="col" class="px-3 py-3">Category</th>
                        <th scope="col" class="px-3 py-3">Status</th>
                        <th scope="col" class="px-3 py-3">Order</th>
                        <th scope="col" class="py-3 pr-4 pl-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($properties as $property)
                        <tr class="border-b border-border transition-colors last:border-b-0 hover:bg-surface-alt">
                            <td class="py-3 pr-3 pl-4">
                                <x-property-thumb :property="$property" />
                            </td>
                            <td class="px-3 py-3">
                                <div class="font-medium">{{ $property->title }}</div>
                                <div class="text-[13px] leading-[18px] text-ink-muted">{{ $property->location }}</div>
                            </td>
                            <td class="px-3 py-3">{{ $property->category->label() }}</td>
                            <td class="px-3 py-3">
                                <x-status-badge :published="$property->is_published" />
                            </td>
                            <td class="px-3 py-3 tabular-nums">{{ $property->sort_order }}</td>
                            <td class="py-3 pr-4 pl-3">
                                <div class="flex items-center justify-end gap-1">
                                    @include('admin.properties.partials.row-actions')
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            {{-- ch. 8.7: below 640px the table becomes a stacked list, one
                 block per property, with the actions on their own row. Six
                 columns cannot be made to work at 375px, and a horizontally
                 scrolling table hides the actions column exactly where it is
                 hardest to discover. --}}
            <ul class="sm:hidden">
                @foreach ($properties as $property)
                    <li class="border-b border-border p-4 last:border-b-0">
                        <div class="flex items-start gap-3">
                            <x-property-thumb :property="$property" class="shrink-0" />
                            <div class="min-w-0 flex-1">
                                <div class="truncate text-sm font-medium">{{ $property->title }}</div>
                                <div class="text-[13px] leading-[18px] text-ink-muted">
                                    {{ $property->category->label() }} &middot; {{ $property->location }}
                                </div>
                            </div>
                            <x-status-badge :published="$property->is_published" />
                        </div>

                        <div class="mt-3 flex items-center justify-between">
                            <span class="text-[13px] leading-[18px] text-ink-muted tabular-nums">
                                Order {{ $property->sort_order }}
                            </span>
                            <div class="flex items-center gap-1">
                                @include('admin.properties.partials.row-actions')
                            </div>
                        </div>
                    </li>
                @endforeach
            </ul>
        </div>

        @include('admin.properties.partials.pager')
    @endif

    @include('admin.properties.partials.confirm-delete')
@endsection
