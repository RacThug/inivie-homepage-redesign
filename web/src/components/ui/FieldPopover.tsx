"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface";

/**
 * How a search field is dressed, which depends on where the panel is.
 *
 * At rest the panel sits at the foot of the hero, so its menus open upward or
 * there is no room for them. Docked under the header the same menus have to
 * open downward for the same reason. `compact` drops the eyebrow to a screen
 * reader only label, because a docked bar is a band across a page someone is
 * reading rather than the main event.
 */
export interface FieldChrome {
  compact: boolean;
  placement: "top" | "bottom";
}

export const RESTING_CHROME: FieldChrome = {
  compact: false,
  placement: "top",
};

interface FieldPopoverProps {
  chrome: FieldChrome;
  /** Eyebrow above the trigger, and the accessible name the panel takes. */
  label: string;
  /** What the trigger reads when something has been chosen. */
  value: string;
  /** A second line under the value, for a detail the value has no room for. */
  detail?: string;
  icon?: ReactNode;
  className?: string;
  panelClassName?: string;
  children: (close: () => void) => ReactNode;
}

/**
 * A labelled trigger with a panel under it, which is the shape all three
 * search fields now take.
 *
 * They are one component because the disclosure is the part that is easy to
 * get wrong and pointless to write three times: `aria-expanded` on a button
 * that owns the panel, Escape closing it and handing focus back, a pointer
 * outside dismissing it, and focus moving into the panel on open so a keyboard
 * lands where the eye does.
 *
 * The panel is `surface` on an `ink` field for the same reason the header's
 * brand panels are: a menu over a photograph has to carry its own ground, and
 * `ink` on `ink` would be a shape with no edge.
 */
export function FieldPopover({
  chrome,
  label,
  value,
  detail,
  icon,
  className,
  panelClassName,
  children,
}: FieldPopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const labelId = `${baseId}-label`;
  const triggerId = `${baseId}-trigger`;

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const trigger = triggerRef.current;

    // The first thing inside, so a keyboard is already where the panel is.
    panel?.querySelector<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"]), input',
    )?.focus();

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);

      /*
        Only when focus is still inside the panel that is going away, which is
        what Escape and choosing an option both leave behind. Restoring it
        unconditionally would yank focus off whatever the visitor just clicked
        outside, which is the opposite of helpful.
      */
      if (panel?.contains(document.activeElement)) trigger?.focus();
    };
  }, [open]);

  /** Pure state, so the panel's own content can hold it without holding a
   *  ref. The focus restore above is what makes that safe. */
  const close = useCallback(() => setOpen(false), []);

  return (
    <div
      className={`relative ${className ?? ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          close();
        }
      }}
      ref={rootRef}
    >
      <span
        className={
          chrome.compact
            ? "sr-only"
            : "block pb-1.5 text-eyebrow font-medium uppercase text-gold"
        }
        id={labelId}
      >
        {label}
      </span>

      <button
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        /*
          Both, in that order, so the control announces as "Dates, 23 Aug to
          24 Aug" rather than as a date with no idea what it belongs to. The
          eyebrow is a `span` and not a `label` because there is no form
          control under it to be the label of: the value is a button.
        */
        aria-labelledby={`${labelId} ${triggerId}`}
        id={triggerId}
        className={`flex h-12 w-full items-center gap-2 rounded-control border border-surface/25 px-3 text-left text-body text-surface transition-colors hover:border-surface/50 ${FOCUS_RING}`}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        ref={triggerRef}
        type="button"
      >
        {icon && <span className="flex-none text-gold">{icon}</span>}
        <span className="min-w-0 flex-1 truncate">
          {value}
          {detail && (
            <span className="ml-2 text-small text-on-ink-muted">{detail}</span>
          )}
        </span>
      </button>

      {open && (
        /*
          Upward, not downward. This panel lives at the foot of the hero by
          design, so a menu opening below its trigger opens off the bottom of
          the window: the two month calendar measured 418px tall against 60px
          of room. On a phone it is a sheet pinned to the bottom of the window
          instead, which is the one position that cannot overflow whichever
          field in the stack opened it.
        */
        <div
          aria-label={label}
          /*
            The sheet's own `bottom-3` has to be released by whichever
            placement wins, not merely competed with. Left in force alongside
            `sm:top-full` it pins both edges of the panel and the two month
            calendar collapses to the 26px between them.
          */
          className={`fixed inset-x-3 bottom-3 z-50 max-h-[80vh] animate-enter overflow-y-auto rounded-card border border-border bg-surface p-3 text-ink shadow-raised sm:absolute sm:inset-x-auto sm:left-0 sm:max-h-none sm:overflow-visible ${
            chrome.placement === "top"
              ? "sm:bottom-full sm:top-auto sm:mb-2"
              : "sm:bottom-auto sm:top-full sm:mt-2"
          } ${panelClassName ?? ""}`}
          id={panelId}
          ref={panelRef}
          role="dialog"
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}
