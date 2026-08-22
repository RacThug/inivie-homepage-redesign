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
    {{-- The failure summary of ch. 8.5, in the shape the property form
         already uses: one line, because the messages themselves belong at
         their controls.

         Two of the failures this screen can produce have no control to
         belong to. A batch refused whole is about the list, and a publish
         action that arrived without its state is about a form that has gone
         wrong, so each is stated here in full. Everything else is a position,
         and every position is already announced at its own input, so the
         line counts them rather than picking one out and leaving the admin
         to guess which row it came from. --}}
    @if ($errors->any())
        <x-notice variant="failure" class="mb-4">
            <span class="font-medium text-danger">
                @if ($errors->has('order'))
                    {{ $errors->first('order') }}
                @elseif ($errors->has('publish'))
                    {{ $errors->first('publish') }}
                @elseif (count($errors->keys()) === 1)
                    One position needs fixing before the order can be saved.
                @else
                    {{ count($errors->keys()) }} positions need fixing before the order can be saved.
                @endif
            </span>
        </x-notice>
    @endif

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
                 the actions column right aligned and last.

                 ch. 8.7 turns this into a stacked list below 640px, and it
                 does so by relaying the same cells rather than by rendering
                 the rows a second time. Two renderings would mean two copies
                 of every position input in the document, submitting the same
                 name twice, and the hidden one would win: an admin who
                 retyped a number on a desktop would have their edit
                 overwritten by the value the invisible mobile copy still
                 held. One row, laid out twice.

                 Which is why every role below is written out. Changing the
                 `display` of a table element drops its implicit semantics in
                 every major browser, so the `block` and `grid` this layout
                 needs would otherwise hand a screen reader a pile of
                 undifferentiated text at exactly the width where the visual
                 grouping is doing the most work. The explicit roles say what
                 the elements already are, and they survive the display
                 change. The column headers do not: `thead` is genuinely gone
                 below 640px, which is why each position input carries its own
                 visible label there. --}}
            <table role="table" class="w-full text-sm max-sm:block">
                <caption class="sr-only">Properties, in the order the homepage renders them</caption>
                <thead role="rowgroup" class="max-sm:hidden">
                    <tr role="row" class="border-b border-border bg-surface-alt text-left text-[13px] leading-[18px] font-medium text-ink-muted">
                        <th role="columnheader" scope="col" class="w-20 py-3 pr-3 pl-4">
                            <span class="sr-only">Image</span>
                        </th>
                        <th role="columnheader" scope="col" class="px-3 py-3">Title</th>
                        <th role="columnheader" scope="col" class="px-3 py-3">Category</th>
                        <th role="columnheader" scope="col" class="px-3 py-3">Status</th>
                        <th role="columnheader" scope="col" class="w-28 px-3 py-3">Order</th>
                        <th role="columnheader" scope="col" class="py-3 pr-4 pl-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody role="rowgroup" class="max-sm:block">
                    @foreach ($properties as $property)
                        <tr role="row" class="border-b border-border transition-colors last:border-b-0 hover:bg-surface-alt max-sm:grid max-sm:grid-cols-[3.5rem_1fr_auto] max-sm:items-start max-sm:gap-x-3 max-sm:gap-y-3 max-sm:p-4">
                            <td role="cell" class="py-3 pr-3 pl-4 max-sm:col-start-1 max-sm:row-start-1 max-sm:p-0">
                                <x-property-thumb :property="$property" />
                            </td>
                            <td role="cell" class="px-3 py-3 max-sm:col-start-2 max-sm:row-start-1 max-sm:min-w-0 max-sm:p-0">
                                <div class="font-medium max-sm:truncate">{{ $property->title }}</div>
                                <div class="text-[13px] leading-[18px] text-ink-muted">
                                    {{-- The category has no column of its own below 640px, so it
                                         joins the location on the line underneath the title. --}}
                                    <span class="sm:hidden">{{ $property->category->label() }} &middot; </span>{{ $property->location }}
                                </div>
                            </td>
                            <td role="cell" class="px-3 py-3 max-sm:hidden">{{ $property->category->label() }}</td>
                            <td role="cell" class="px-3 py-3 max-sm:col-start-3 max-sm:row-start-1 max-sm:p-0">
                                <x-status-badge :published="$property->is_published" />
                            </td>
                            <td role="cell" class="px-3 py-3 max-sm:col-span-3 max-sm:col-start-1 max-sm:row-start-2 max-sm:p-0">
                                @include('admin.properties.partials.order-input')
                            </td>
                            {{-- ch. 8.7 puts the actions on their own row in the stacked
                                 list, which is also the only way three of them fit at
                                 375px beside anything else. --}}
                            <td role="cell" class="py-3 pr-4 pl-3 max-sm:col-span-3 max-sm:col-start-1 max-sm:row-start-3 max-sm:p-0">
                                <div class="flex items-center justify-end gap-1">
                                    @include('admin.properties.partials.row-actions')
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            @include('admin.properties.partials.reorder-bar')
        </div>

        @include('admin.properties.partials.pager')
    @endif

    @include('admin.properties.partials.confirm-delete')
@endsection
