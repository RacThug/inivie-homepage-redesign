{{--
    The navigation itself, shared by the sidebar and the mobile drawer so the
    two can never disagree about what the panel contains.

    One item today. The `Content` group heading of docs/DESIGN-SYSTEM.md
    ch. 8.3 arrives with the first item that belongs under it, in the property
    CRUD. A heading over an empty group, or a greyed out link to a screen that
    does not exist, would read as unfinished, which is exactly what PRD ch. 7.2
    rules out.

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
</nav>
