/**
 * The two pieces of the admin shell that need a browser.
 *
 * Everything else in the panel is server rendered. These are here because a
 * collapse that costs a round trip is worse than no collapse, and because a
 * drawer without a focus trap is not accessible.
 *
 * docs/DESIGN-SYSTEM.md ch. 8.3.
 */

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

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

    drawer.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            close();

            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        // Read on every Tab rather than cached on open: the drawer holds a
        // logout form, and a cached list would go stale the moment anything
        // inside it changed.
        const focusable = [...drawer.querySelectorAll(FOCUSABLE)];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
}

initRail();
initDrawer();
