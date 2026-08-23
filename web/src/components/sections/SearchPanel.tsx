"use client";

import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { PinIcon } from "@/components/ui/PinIcon";
import {
  DEFAULT_ADULTS,
  DESTINATIONS,
  SEARCH_ACTION,
  SEARCH_PANEL,
} from "@/content/hero";

/**
 * The search panel that sits on the hero. Brief ch. 4.2.1.
 *
 * It is a real form and nothing more: a GET to the booking system with the
 * three things a visitor picked. Booking runs on a separate application, which
 * PRD ch. 3.2 puts out of scope, so this hands over and stops.
 *
 * Below the tablet breakpoint it collapses to one tappable row, because three
 * fields side by side do not fit 375px. That collapse is the only React state
 * here, and it is one boolean.
 */

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface";

/** One height for the select and both date inputs. A `date` input is taller
 *  than a `select` at the same padding, because the browser draws a picker
 *  inside it, and three fields in a row that disagree by three pixels put
 *  their labels on three different lines. */
const FIELD =
  "h-12 w-full rounded-control border border-surface/25 bg-transparent px-3 text-body text-surface";

const DAY_MS = 24 * 60 * 60 * 1000;

/** ISO, because that is what a `date` input reads and writes. */
function isoDate(from: number | string, offsetDays = 0): string {
  return new Date(new Date(from).getTime() + offsetDays * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/**
 * Tonight and tomorrow, written straight to the input on mount rather than
 * rendered.
 *
 * The homepage is prerendered, so a default computed while rendering would be
 * the date the build ran and would still be that date a month later. Putting
 * it in React state instead would mean the server rendering one value and the
 * client another, which is a hydration mismatch. The date fields are therefore
 * uncontrolled and the browser owns them, which is what they are for.
 */
function fillEmptyDate(node: HTMLInputElement | null, offsetDays: number) {
  if (node && !node.value) node.value = isoDate(Date.now(), offsetDays);
}

export function SearchPanel() {
  const fieldId = useId();
  const [open, setOpen] = useState(false);
  const checkOutRef = useRef<HTMLInputElement>(null);

  /** A stay that ends before it starts is not a stay. Moving the floor is the
   *  browser's own validation, so no message has to be written here. */
  function onCheckInChange(checkIn: string) {
    const checkOut = checkOutRef.current;
    if (!checkOut || !checkIn) return;

    checkOut.min = isoDate(checkIn, 1);
    if (checkOut.value <= checkIn) checkOut.value = isoDate(checkIn, 1);
  }

  return (
    <form
      action={SEARCH_ACTION}
      aria-label={SEARCH_PANEL.label}
      className="rounded-card bg-ink/95 p-4 shadow-raised lg:p-5"
      method="get"
    >
      <input name="adults" type="hidden" value={DEFAULT_ADULTS} />

      {/*
        The summary row is the panel on a phone, and is not rendered at all
        from the tablet breakpoint, where the fields fit. Leaving it in place
        under `sm:hidden` would leave assistive technology reading a collapsed
        state off a control that is no longer on screen and a panel that is
        always open.
      */}
      <button
        aria-controls={`${fieldId}-fields`}
        aria-expanded={open}
        className={`flex min-h-11 w-full items-center justify-between gap-3 text-left text-body text-surface sm:hidden ${FOCUS_RING}`}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        type="button"
      >
        <span className="flex items-center gap-2">
          <span className="text-gold">
            <PinIcon />
          </span>
          {SEARCH_PANEL.summary}
        </span>
        <ChevronIcon flipped={open} />
      </button>

      <div
        /*
          Three fields and a button do not fit 375px, so a phone gets the
          summary row above and this stack behind it. A tablet has room for
          two columns and a desktop for one row, and neither of those needs to
          be opened first.
        */
        className={`gap-3 sm:mt-0 sm:grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end ${
          open ? "mt-4 grid" : "hidden"
        }`}
        id={`${fieldId}-fields`}
      >
        <Field
          className="sm:col-span-2 lg:col-span-1"
          id={`${fieldId}-destination`}
          label={SEARCH_PANEL.destination}
        >
          <select
            className={`${FIELD} ${FOCUS_RING}`}
            defaultValue={DESTINATIONS[0].value}
            id={`${fieldId}-destination`}
            name="city"
          >
            {DESTINATIONS.map((destination) => (
              <option key={destination.value} value={destination.value}>
                {destination.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id={`${fieldId}-checkin`} label={SEARCH_PANEL.checkIn}>
          <input
            className={`${FIELD} ${FOCUS_RING}`}
            id={`${fieldId}-checkin`}
            name="checkin"
            onChange={(event) => onCheckInChange(event.target.value)}
            ref={(node) => {
              fillEmptyDate(node, 0);
            }}
            required
            type="date"
          />
        </Field>

        <Field id={`${fieldId}-checkout`} label={SEARCH_PANEL.checkOut}>
          <input
            className={`${FIELD} ${FOCUS_RING}`}
            id={`${fieldId}-checkout`}
            name="checkout"
            ref={(node) => {
              checkOutRef.current = node;
              fillEmptyDate(node, 1);
            }}
            required
            type="date"
          />
        </Field>

        {/* `field` size, so the control ends level with the inputs beside
            it rather than 4px short of them. */}
        <div
          className={`sm:col-span-2 sm:mt-1 lg:col-span-1 lg:mt-0 ${
            open ? "mt-1" : ""
          }`}
        >
          <Button fullWidth size="field" type="submit">
            {SEARCH_PANEL.submit}
          </Button>
        </div>
      </div>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}

/** Eyebrow scale in `gold`, which carries text on an ink ground at 6.87 to 1
 *  (DESIGN-SYSTEM ch. 2.2). */
function Field({ id, label, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label
        className="block pb-1.5 text-eyebrow font-medium uppercase text-gold"
        htmlFor={id}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ChevronIcon({ flipped }: { flipped: boolean }) {
  return (
    <svg
      aria-hidden
      className={`flex-none transition-transform ${flipped ? "rotate-180" : ""}`}
      fill="none"
      height="12"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.75"
      viewBox="0 0 12 12"
      width="12"
    >
      <path d="M2 4.5 6 8.5l4-4" />
    </svg>
  );
}
