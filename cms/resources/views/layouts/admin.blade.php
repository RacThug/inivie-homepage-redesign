{{--
    The admin shell of docs/DESIGN-SYSTEM.md ch. 8.3: a sidebar in three
    states across two breakpoints. Expanded at 240px, a 64px rail once
    collapsed, and a drawer below 1024px.
--}}
@php
    // Read while rendering, so the rail is in the first paint. A state held
    // in localStorage could only be applied after the document arrives, and
    // a Blade admin is full page loads, so that correction would flash on
    // every navigation rather than once at boot. See ch. 8.3.
    $rail = request()->cookie('admin_sidebar') === 'rail';
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    @include('layouts.partials.head')
</head>
<body class="min-h-screen bg-surface-alt text-ink antialiased">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-ink focus:px-4 focus:py-2 focus:text-surface">
        Skip to content
    </a>

    <div class="lg:flex">
        {{-- Below 1024px the sidebar is a drawer, so it needs a bar to open
             it from. The bar does not exist on desktop, where the sidebar is
             always present. --}}
        <header class="flex h-14 items-center gap-3 bg-ink px-4 lg:hidden">
            <button
                type="button"
                data-drawer-open
                aria-controls="admin-drawer"
                aria-expanded="false"
                aria-label="Open navigation"
                class="flex size-9 shrink-0 flex-col items-center justify-center gap-[3px] rounded-control bg-surface/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface"
            >
                <span class="block h-px w-4 bg-surface"></span>
                <span class="block h-px w-4 bg-surface"></span>
                <span class="block h-px w-4 bg-surface"></span>
            </button>
            <span class="text-[15px] font-medium tracking-[-0.01em] text-surface">iNi ViE</span>
        </header>

        {{-- Desktop sidebar. `hidden lg:flex` rather than a width transition,
             because the drawer below is a separate element: one shell that
             tried to be both would need the focus trap active at one
             breakpoint and inert at the other. --}}
        <aside
            id="admin-sidebar"
            data-rail="{{ $rail ? 'true' : 'false' }}"
            class="hidden shrink-0 flex-col bg-ink pb-3.5 lg:sticky lg:top-0 lg:flex lg:h-screen"
        >
            <a
                href="{{ route('admin.dashboard') }}"
                class="flex h-14 items-center px-5 text-[15px] font-medium tracking-[-0.01em] whitespace-nowrap text-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-surface {{ $rail ? 'justify-center px-0' : '' }}"
            >
                {{ $rail ? 'iV' : 'iNi ViE' }}
            </a>

            @include('layouts.partials.nav')

            <div class="mt-auto flex flex-col gap-1.5 border-t border-surface/15 px-5 pt-3 {{ $rail ? 'items-center px-0' : '' }}">
                <span class="side-label truncate text-[13px] leading-[18px] text-muted">
                    {{ auth()->user()->email }}
                </span>

                {{-- Icon first, label second, so collapsing hides the word
                     and not the control. A rail that can be entered but not
                     left would be a trap. --}}
                <form method="POST" action="{{ route('admin.logout') }}">
                    @csrf
                    <button
                        type="submit"
                        title="Log out"
                        aria-label="Log out"
                        class="flex items-center gap-2.5 text-[13px] leading-[18px] font-medium text-surface hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface"
                    >
                        <svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <path d="m16 17 5-5-5-5" />
                            <path d="M21 12H9" />
                        </svg>
                        <span class="side-label">Log out</span>
                    </button>
                </form>

                <button
                    type="button"
                    data-rail-toggle
                    aria-controls="admin-sidebar"
                    aria-expanded="{{ $rail ? 'false' : 'true' }}"
                    title="{{ $rail ? 'Expand' : 'Collapse' }}"
                    aria-label="{{ $rail ? 'Expand sidebar' : 'Collapse sidebar' }}"
                    class="flex items-center gap-2.5 pt-1.5 text-[13px] leading-[18px] text-surface/70 hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface {{ $rail ? 'justify-center' : '' }}"
                >
                    <svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="{{ $rail ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6' }}" />
                    </svg>
                    <span class="side-label">Collapse</span>
                </button>
            </div>
        </aside>

        {{-- The drawer. Same nav partial as the sidebar, so the two cannot
             disagree. Hidden from assistive technology until opened, per
             RS3. --}}
        <div id="admin-drawer" class="hidden lg:hidden" data-drawer>
            <div class="fixed inset-0 z-40 bg-ink/50" data-drawer-scrim></div>
            <div
                class="fixed inset-y-0 left-0 z-50 flex w-66 flex-col bg-ink pb-3.5 shadow-raised"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
            >
                <div class="flex h-14 items-center justify-between px-5">
                    <span class="text-[15px] font-medium tracking-[-0.01em] text-surface">iNi ViE</span>
                    <button
                        type="button"
                        data-drawer-close
                        aria-label="Close navigation"
                        class="p-1 text-surface/70 hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface"
                    >
                        <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                @include('layouts.partials.nav')

                <div class="mt-auto flex flex-col gap-1.5 border-t border-surface/15 px-5 pt-3">
                    <span class="truncate text-[13px] leading-[18px] text-muted">{{ auth()->user()->email }}</span>
                    <form method="POST" action="{{ route('admin.logout') }}">
                        @csrf
                        <button type="submit" class="text-[13px] leading-[18px] font-medium text-surface hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface">
                            Log out
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <main id="main" class="min-w-0 flex-1">
            <div class="mx-auto max-w-[80rem] px-5 pt-6 pb-8 lg:px-10">
                <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 class="text-xl leading-7 font-semibold">@yield('heading')</h1>
                    @yield('action')
                </div>

                @include('layouts.partials.flash')

                @yield('content')
            </div>
        </main>
    </div>
</body>
</html>
