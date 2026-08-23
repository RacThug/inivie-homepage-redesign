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

interface FieldPopoverProps {
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
        className="block pb-1.5 text-eyebrow font-medium uppercase text-gold"
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
          className={`fixed inset-x-3 bottom-3 z-50 max-h-[80vh] animate-enter overflow-y-auto rounded-card border border-border bg-surface p-3 text-ink shadow-raised sm:absolute sm:inset-x-auto sm:bottom-full sm:left-0 sm:mb-2 sm:max-h-none ${panelClassName ?? ""}`}
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
