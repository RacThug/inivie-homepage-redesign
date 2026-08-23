"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { BOOKING_CTA, PRIMARY_NAV } from "@/content/navigation";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Ties the panel to the toggle that opened it, for `aria-controls`. */
  id: string;
  /** The path the drawer should mark as current, if any. */
  pathname?: string;
}

/**
 * Everything focusable the trap has to cycle through. Written as a selector
 * rather than a component list because the panel's contents are free to change
 * without the trap needing to know.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The navigation below 1024px, per RS3.
 *
 * RS3 asks for three things and each is implemented here rather than assumed:
 * focus is trapped inside the panel, Escape closes it, and focus returns to
 * the toggle that opened it. The last one is the part usually missed, and it
 * is what stops a keyboard user being dropped at the top of the document every
 * time they dismiss the menu.
 *
 * The item order matches the desktop navigation exactly. A drawer that
 * reorders its links teaches the visitor two different site structures.
 */
export function MobileDrawer({
  open,
  onClose,
  id,
  pathname,
}: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /**
   * Held in a ref so the effect below depends only on `open`. Taking `onClose`
   * as a dependency would tear the trap down and rebuild it on every parent
   * render, and the focus restore in the cleanup would fire with it.
   */
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;

    const toggle = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const items = Array.from(panel!.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      // Wrapping in both directions is what makes it a trap rather than a
      // suggestion: tab off the end and you land back at the start.
      if (event.shiftKey && (active === first || !panel!.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    // The page behind a modal panel must not scroll with it.
    const restoreOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = restoreOverflow;
      toggle?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/*
        Dismissing by clicking away is a pointer convenience, so the element
        carries no role and no label. Escape is the keyboard route and it is
        handled above.
      */}
      <div
        aria-hidden
        className="absolute inset-0 bg-ink/50"
        onClick={onClose}
      />

      <div
        aria-label="Site menu"
        aria-modal="true"
        className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-surface"
        id={id}
        ref={panelRef}
        role="dialog"
      >
        <div className="flex items-center justify-end border-b border-border px-5 py-3">
          <button
            aria-label="Close menu"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control text-ink transition-colors hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-5">
          <ul className="flex flex-col">
            {PRIMARY_NAV.map((item) => {
              const current = pathname === item.href;

              return (
                <li key={item.href}>
                  <a
                    aria-current={current ? "page" : undefined}
                    className="flex min-h-11 items-center border-b border-border py-3 font-heading text-h3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    href={item.href}
                  >
                    <span
                      className={
                        current ? "border-b-2 border-accent pb-0.5" : undefined
                      }
                    >
                      {item.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-5">
          <Button fullWidth href={BOOKING_CTA.href}>
            {BOOKING_CTA.label}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.75"
      viewBox="0 0 20 20"
      width="20"
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}
