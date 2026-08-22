{{--
    The flash message of docs/DESIGN-SYSTEM.md ch. 8.5, full width of the page
    container and directly beneath the page header.

    Every completed action in the panel writes one, which is the second half
    of C8: a form that silently returns to a list leaves the admin guessing
    whether it worked. `PropertyController` sets `status` on create, update
    and delete, and `LoginController` on sign out.

    The treatment itself belongs to `<x-notice>`, so this partial decides only
    where the message goes and which session key it reads.
--}}
@if (session('status'))
    <x-notice class="mb-4">{{ session('status') }}</x-notice>
@endif

@if (session('error'))
    <x-notice variant="failure" class="mb-4">
        <span class="font-medium text-danger">{{ session('error') }}</span>
    </x-notice>
@endif
