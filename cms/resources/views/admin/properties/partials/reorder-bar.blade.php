{{--
    The reorder form itself: a footer bar on the table, holding the sentence
    that explains the numbers and the one control that saves them.

    It is empty of fields on purpose. Every position input in the table
    points at this form by id, so one submission carries the whole page as
    the batch docs/TECHNICAL-DESIGN.md ch. 5.6 describes, and the controller
    applies it inside a transaction.

    The scope is the page rather than the table, which is worth saying out
    loud: with a pager in play, saving here moves the rows the admin can see
    and leaves the rest where they were.
--}}
<form
    id="reorder"
    method="POST"
    action="{{ route('admin.properties.reorder') }}"
    class="flex flex-col gap-3 border-t border-border bg-surface-alt px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
>
    @csrf

    <p class="text-[13px] leading-[18px] text-ink-muted">
        Lower numbers come first. Properties sharing a number fall back to the newest.
        {{-- Said only when there is a second page to be confused with. On a
             single page list the sentence would be answering a question the
             admin has no way to ask. --}}
        @if ($properties->hasPages())
            Saving affects this page only.
        @endif
    </p>

    {{-- Secondary rather than primary: the primary action of this screen is
         adding a property, and two filled buttons on one page would leave
         neither of them meaning "the main thing here". --}}
    <button type="submit" class="btn btn-secondary w-full sm:w-auto">Save order</button>
</form>
