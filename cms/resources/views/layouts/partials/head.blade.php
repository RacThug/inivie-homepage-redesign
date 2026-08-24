{{--
    Shared document head. No `@fonts`, and no font link of any kind: the admin
    runs on the system UI stack, per docs/DESIGN-SYSTEM.md ch. 8.1.
--}}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">

{{-- The panel is private. Keeping it out of an index costs one header. --}}
<meta name="robots" content="noindex, nofollow">

{{-- The brand mark, the same file the frontend serves. Declared rather than
     left to the browser's guess at /favicon.ico: the guess is only made once
     per origin and is not made at all by every browser, and an admin working
     with the CMS and the site open together should be able to tell the two
     tabs apart by their icon rather than by reading them. --}}
<link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">

<title>@yield('title', 'Admin') &middot; {{ config('app.name') }}</title>

@vite(['resources/css/app.css', 'resources/js/app.js'])
