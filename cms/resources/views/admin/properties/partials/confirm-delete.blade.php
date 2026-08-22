{{--
    The confirm modal of docs/DESIGN-SYSTEM.md ch. 8.5, and the only raised
    element in the panel: centred, at most 420px wide, over an `ink` scrim at
    50%.

    One modal for the whole page rather than one per row. Six rows would mean
    six copies of the same dialog in the document, and the sentence is the
    only thing that differs between them.

    The sentence names the exact record, which is the point of the control: a
    dialog that asks "are you sure?" without saying what about is a dialog
    the admin dismisses by reflex.
--}}
<div id="confirm-delete" class="hidden" data-confirm>
    <div class="fixed inset-0 z-40 bg-ink/50" data-confirm-scrim></div>

    <div class="fixed inset-0 z-50 flex items-center justify-center p-5">
        <div
            class="w-full max-w-[420px] rounded-card bg-surface p-5 shadow-raised"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-body"
        >
            <h2 id="confirm-delete-title" class="text-base font-semibold">Delete this property?</h2>

            <p id="confirm-delete-body" class="mt-2 text-sm text-ink-muted">
                <span data-confirm-subject class="font-medium text-ink"></span>
                will be removed from the admin and from the homepage.
            </p>

            <div class="mt-5 flex justify-end gap-2">
                {{-- Cancel first in the DOM as well as on screen: it takes
                     focus on open, and the destructive button should never be
                     what a stray Enter reaches first. --}}
                <button type="button" class="btn btn-secondary" data-confirm-cancel>Cancel</button>
                <button type="button" class="btn btn-danger" data-confirm-accept>Delete</button>
            </div>
        </div>
    </div>
</div>
