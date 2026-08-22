{{--
    The shell for the one admin screen that has no shell, per
    docs/DESIGN-SYSTEM.md ch. 8.6: a surface-alt page holding a single centred
    surface panel.

    It exists as a layout rather than as one self contained Blade file so the
    `title` section resolves. `@yield` only reads sections a child view
    declared, so a standalone page always renders the default and every screen
    would be called "Admin".
--}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    @include('layouts.partials.head')
</head>
<body class="min-h-screen bg-surface-alt text-ink antialiased">
    <div class="flex min-h-screen items-center justify-center px-4 py-10">
        <div class="w-full max-w-[380px] rounded-card border border-border bg-surface p-8">
            <div class="text-[15px] font-medium tracking-[-0.01em]">iNi ViE</div>
            <h1 class="mt-1 mb-5 text-xl leading-7 font-semibold">@yield('heading')</h1>

            @include('layouts.partials.flash')

            @yield('content')
        </div>
    </div>
</body>
</html>
