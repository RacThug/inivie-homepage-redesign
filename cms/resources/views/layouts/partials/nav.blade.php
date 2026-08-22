{{--
    The navigation itself, shared by the sidebar and the mobile drawer so the
    two can never disagree about what the panel contains.

    The `Content` group heading of docs/DESIGN-SYSTEM.md ch. 8.3 arrives here
    with Properties, the first item that belongs under it. In the rail it
    becomes a divider rule rather than disappearing, because the grouping
    still exists even when its names are not shown. That swap is CSS on one
    element, per the rule in ch. 8.3 that nothing about the rail may be
    decided in the template.

    Every item carries a `title` and an `aria-label` because the rail hides
    the label text. They are set here rather than only in the rail markup, so
    the two states cannot drift apart.

    Icons are inline SVG from one set, 20px at 1.5px stroke, per ch. 8.5.
--}}
<nav class="flex flex-1 flex-col py-2" aria-label="Admin sections">
    <a
        href="{{ route('admin.dashboard') }}"
        title="Dashboard"
        aria-label="Dashboard"
        @class(['side-item', 'side-item-active' => request()->routeIs('admin.dashboard')])
        @if (request()->routeIs('admin.dashboard')) aria-current="page" @endif
    >
        <svg class="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span class="side-label">Dashboard</span>
    </a>

    <span class="side-group">Content</span>

    <a
        href="{{ route('admin.properties.index') }}"
        title="Properties"
        aria-label="Properties"
        @class(['side-item', 'side-item-active' => request()->routeIs('admin.properties.*')])
        @if (request()->routeIs('admin.properties.*')) aria-current="page" @endif
    >
        {{-- A building, because that is what a property is. The icon has to
             read at 20px in the rail, so it is three strokes and no
             windows. --}}
        <svg class="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 21h18" />
            <path d="M5 21V7l7-4 7 4v14" />
            <path d="M10 21v-5h4v5" />
        </svg>
        <span class="side-label">Properties</span>
    </a>
</nav>
