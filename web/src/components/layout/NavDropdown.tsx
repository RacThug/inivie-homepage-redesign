"use client";

import { useId, useRef, useState } from "react";

import type { NavGroup } from "@/content/navigation";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";

interface NavDropdownProps {
  group: NavGroup;
  /** The header's current label colour, which the trigger inherits. */
  labelColour: string;
}

/**
 * One hover group in the desktop navigation.
 *
 * Production opens these with `group-hover` and nothing else, which means the
 * four brand families are unreachable without a mouse. Hover is kept, because
 * it is the behaviour the client asked for and it is the right one for a
 * pointer, but it is an addition to a real disclosure rather than the whole
 * mechanism: the trigger is a button that reports `aria-expanded`, click and
 * Enter toggle it, Down arrow opens it and moves into the panel, Escape closes
 * it and hands focus back. That is the same list `MobileDrawer` implements for
 * RS3, applied to the control that has the same problem.
 *
 * Pointer opening is limited to a mouse. On a touch screen `pointerenter`
 * fires on the tap that precedes the click, so an unfiltered handler would
 * open the panel and the click would immediately close it again.
 */
export function NavDropdown({ group, labelColour }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  /**
   * What opened the last click, which the click handler needs and the click
   * event does not carry: `MouseEvent` has no `pointerType`.
   */
  const pointerType = useRef("");

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  return (
    <div
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setOpen(false);
      }}
      /*
        Tabbing out of the last item has to dismiss the panel, and there is no
        blur event for "focus left this subtree". `relatedTarget` is where
        focus went, so the panel closes only when that is somewhere else.
      */
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          close(true);
        }
      }}
    >
      <button
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        className={`group inline-flex min-h-11 items-center gap-1.5 text-small font-medium transition-colors ${labelColour} ${FOCUS_RING}`}
        /*
          A mouse has already opened the panel by hovering to reach this, so
          its click opens rather than toggles: closing what the pointer is
          still sitting on is the behaviour that makes a hover menu feel
          broken, and production's does nothing here at all. Touch and keyboard
          have no hover to have opened it, so for them this is the toggle.
        */
        onClick={(event) => {
          const fromMouse = event.detail > 0 && pointerType.current === "mouse";
          setOpen((wasOpen) => (fromMouse ? true : !wasOpen));
        }}
        onPointerDown={(event) => {
          pointerType.current = event.pointerType;
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;
          event.preventDefault();
          setOpen(true);
          // The panel is not mounted yet on the render this handler runs in.
          requestAnimationFrame(() =>
            panelRef.current?.querySelector("a")?.focus(),
          );
        }}
        ref={triggerRef}
        type="button"
      >
        {/*
          Accent marks, it never carries the label: it reaches 2.39 to 1 on a
          light surface (DESIGN-SYSTEM ch. 2.3), and the transparent state sits
          over an arbitrary photograph where no ratio is guaranteed at all. The
          rule is the same marker `aria-current` uses in the header, so hover,
          open and current all read as one idea rather than three.
        */}
        <span
          className={`border-b-2 pb-1 transition-colors ${
            open ? "border-accent" : "border-transparent group-hover:border-accent"
          }`}
        >
          {group.label}
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full pt-2"
          /*
            The trigger's own box stops at its baseline, so without this the
            pointer crosses a dead strip on the way down and `pointerleave`
            fires. Padding on the panel's wrapper bridges it, rather than a
            timeout that guesses how fast someone moves a mouse.
          */
          ref={panelRef}
        >
          <div
            className="min-w-56 animate-enter rounded-control border border-border bg-surface p-2 shadow-raised"
            id={panelId}
          >
            <ul>
              {group.children.map((child) => (
                <li key={child.href}>
                  <a
                    className="flex min-h-11 items-center rounded-control px-3 py-2 text-small text-ink transition-colors hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    href={child.href}
                    onClick={() => close(false)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {child.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      className={`transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 14 14"
      width="14"
    >
      <path d="M3.5 5.25L7 8.75l3.5-3.5" />
    </svg>
  );
}
