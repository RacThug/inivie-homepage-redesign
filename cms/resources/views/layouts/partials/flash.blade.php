{{--
    docs/DESIGN-SYSTEM.md ch. 8.5. A surface panel with a 3px left rule: ink
    for a completed action, danger for a failure.

    It persists until the next navigation and is never dismissed on a timer,
    because a message that removes itself is a message the admin can miss.

    Nothing sets these yet. The partial ships with the shell rather than with
    the first screen that flashes, so the property CRUD gets one treatment to
    reuse instead of inventing its own.
--}}
@if (session('status'))
    <div class="mb-4 rounded-control border border-border border-l-[3px] border-l-ink bg-surface px-4 py-3 text-sm" role="status">
        {{ session('status') }}
    </div>
@endif

@if (session('error'))
    <div class="mb-4 rounded-control border border-border border-l-[3px] border-l-danger bg-surface px-4 py-3 text-sm" role="alert">
        <span class="font-medium text-danger">{{ session('error') }}</span>
    </div>
@endif
