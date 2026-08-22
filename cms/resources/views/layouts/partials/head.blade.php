{{--
    Shared document head. No `@fonts`, and no font link of any kind: the admin
    runs on the system UI stack, per docs/DESIGN-SYSTEM.md ch. 8.1.
--}}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">

{{-- The panel is private. Keeping it out of an index costs one header. --}}
<meta name="robots" content="noindex, nofollow">

<title>@yield('title', 'Admin') &middot; {{ config('app.name') }}</title>

@vite(['resources/css/app.css', 'resources/js/app.js'])
