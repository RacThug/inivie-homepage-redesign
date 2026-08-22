/**
 * The three pieces of the admin panel that need a browser.
 *
 * Everything else is server rendered. These are here because a collapse that
 * costs a round trip is worse than no collapse, because a drawer without a
 * focus trap is not accessible, and because a delete without a question is a
 * delete that happens by accident.
 *
 * docs/DESIGN-SYSTEM.md ch. 8.3 and ch. 8.5.
 */

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The keyboard contract every overlay in the panel owes, per RS3: Escape
 * closes, and Tab cycles inside rather than escaping to the page behind.
 *
 * Written once and handed to both the drawer and the confirm modal. Two
 * copies of a focus trap is two chances to fix a bug in one of them.
 */
function overlayKeydown(container, close) {
    return (event) => {
        if (event.key === 'Escape') {
            close();

            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        // Read on every Tab rather than cached on open: these overlays hold
        // forms, and a cached list would go stale the moment anything inside
        // one of them changed.
        const focusable = [...container.querySelectorAll(FOCUSABLE)];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };
}

/**
 * The sidebar rail.
 *
 * The class swap is applied immediately so the collapse feels instant, and
 * the cookie is written so the *next* page renders at the right width from
 * its first paint. It is a plain cookie rather than an encrypted one because
 * Blade has to read it while rendering; bootstrap/app.php excludes it from
 * encryption for that reason.
 */
function initRail() {
    const sidebar = document.getElementById('admin-sidebar');
    const toggle = document.querySelector('[data-rail-toggle]');

    if (!sidebar || !toggle) {
        return;
    }

    toggle.addEventListener('click', () => {
        const rail = sidebar.dataset.rail !== 'true';

        // The attribute is the whole state. CSS derives the width from it,
        // so the browser and the server cannot disagree about what 240
        // and 64 mean.
        sidebar.dataset.rail = rail ? 'true' : 'false';

        toggle.setAttribute('aria-expanded', rail ? 'false' : 'true');
        toggle.setAttribute('aria-label', rail ? 'Expand sidebar' : 'Collapse sidebar');
        toggle.setAttribute('title', rail ? 'Expand' : 'Collapse');

        // A year, because this is a preference rather than a session fact.
        // SameSite=Lax keeps it off cross site requests; it carries no secret
        // either way, only a width.
        document.cookie = `admin_sidebar=${rail ? 'rail' : 'expanded'}; path=/; max-age=31536000; SameSite=Lax`;
    });
}

/**
 * The mobile drawer, following RS3: focus trapped inside, Escape closes, and
 * focus returns to the control that opened it.
 *
 * The same rules as the public site's mobile navigation, deliberately. The
 * frontend has to implement them anyway, so the admin adopts the behaviour
 * rather than inventing a second set.
 */
function initDrawer() {
    const drawer = document.querySelector('[data-drawer]');
    const opener = document.querySelector('[data-drawer-open]');

    if (!drawer || !opener) {
        return;
    }

    const close = () => {
        drawer.classList.add('hidden');
        opener.setAttribute('aria-expanded', 'false');
        opener.focus();
    };

    opener.addEventListener('click', () => {
        drawer.classList.remove('hidden');
        opener.setAttribute('aria-expanded', 'true');
        drawer.querySelector(FOCUSABLE)?.focus();
    });

    drawer.querySelector('[data-drawer-close]')?.addEventListener('click', close);
    drawer.querySelector('[data-drawer-scrim]')?.addEventListener('click', close);

    drawer.addEventListener('keydown', overlayKeydown(drawer, close));
}

/**
 * The delete confirmation of ch. 8.5.
 *
 * The markup it enhances is a real form, so a delete still works with
 * scripting unavailable: it simply happens without the extra question. This
 * intercepts the submit, names the property in the dialog, and replays the
 * submit once the admin confirms.
 *
 * `form.submit()` deliberately does not fire the submit event, so the replay
 * cannot loop back into the handler that opened the dialog.
 */
function initConfirmDelete() {
    const modal = document.querySelector('[data-confirm]');
    const forms = document.querySelectorAll('form[data-confirm-delete]');

    if (!modal || forms.length === 0) {
        return;
    }

    const subject = modal.querySelector('[data-confirm-subject]');
    const accept = modal.querySelector('[data-confirm-accept]');
    const cancel = modal.querySelector('[data-confirm-cancel]');

    // The form waiting on an answer, and the button that asked. The button is
    // where focus goes back to on a cancel, because that is where the admin
    // was: returning focus to the top of the table would lose their place in
    // a list of twenty rows.
    let pending = null;
    let opener = null;

    const close = () => {
        modal.classList.add('hidden');
        pending = null;
        opener?.focus();
        opener = null;
    };

    forms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            pending = form;
            opener = form.querySelector('button[type="submit"]');
            subject.textContent = form.dataset.subject ?? 'This property';

            modal.classList.remove('hidden');

            // Cancel takes focus, not the destructive button. A dialog that
            // opens with Delete focused turns a stray Enter into a deletion.
            cancel.focus();
        });
    });

    accept.addEventListener('click', () => pending?.submit());
    cancel.addEventListener('click', close);
    modal.querySelector('[data-confirm-scrim]')?.addEventListener('click', close);
    modal.addEventListener('keydown', overlayKeydown(modal, close));
}

initRail();
initDrawer();
initConfirmDelete();
