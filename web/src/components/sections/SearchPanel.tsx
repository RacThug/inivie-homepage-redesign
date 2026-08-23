"use client";

import { useId, useState } from "react";

import { DateRangeField } from "@/components/search/DateRangeField";
import { DestinationField } from "@/components/search/DestinationField";
import { GuestsField } from "@/components/search/GuestsField";
import { Button } from "@/components/ui/Button";
import type { FieldChrome } from "@/components/ui/FieldPopover";
import { PinIcon } from "@/components/ui/PinIcon";
import { SEARCH_ACTION, SEARCH_PANEL } from "@/content/hero";
import { startOfToday } from "@/lib/dates";

/**
 * The search panel that sits on the hero. Brief ch. 4.2.1.
 *
 * It is a real form and nothing more: a GET to the booking system with what
 * the visitor picked. Booking runs on a separate application, which PRD
 * ch. 3.2 puts out of scope, so this hands over and stops. Every control below
 * writes to a hidden input for that reason: the fields are this project's, the
 * query string is production's.
 *
 * Three fields, not four. The stay used to be two `date` inputs and is now one
 * range, which is both the honest shape of the decision and where the column
 * for the guest count came from.
 *
 * Below the tablet breakpoint it collapses to one tappable row, because the
 * fields side by side do not fit 375px.
 */

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface";

interface SearchPanelProps {
  /**
   * Docked under the header rather than resting on the hero.
   *
   * The same panel and the same state either way. It is one component and one
   * form because two would be two sets of fields to keep in step, and a
   * visitor who picked their dates on the hero would find them missing from
   * the bar that replaced it.
   */
  docked?: boolean;
}

export function SearchPanel({ docked = false }: SearchPanelProps) {
  const fieldId = useId();
  const chrome: FieldChrome = {
    compact: docked,
    placement: docked ? "bottom" : "top",
  };
  const [open, setOpen] = useState(false);

  /**
   * Midnight today, read once on the client and held.
   *
   * The homepage is prerendered, so a date computed while rendering would be
   * the date the build ran and would still be that date a month later. The
   * lazy initialiser runs on the server too, but only the client's value ever
   * reaches the calendar, and holding it in state stops the floor moving under
   * an open panel at midnight.
   */
  const [today] = useState(() => startOfToday(Date.now()));

  return (
    <form
      action={SEARCH_ACTION}
      aria-label={SEARCH_PANEL.label}
      /*
        Solid ink once docked, 95 per cent at rest. The five per cent lets the
        film show through behind the panel on the hero, which is the point of
        it; over a page of cards it stops reading as depth and starts reading
        as a card's price bleeding through the bar.
      */
      className={`rounded-card shadow-raised ${
        docked ? "bg-ink px-4 py-3 lg:px-5" : "bg-ink/95 p-4 lg:p-5"
      }`}
      method="get"
    >
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
        className={`gap-3 sm:mt-0 sm:grid sm:grid-cols-2 lg:grid-cols-[1.3fr_1.4fr_1fr_auto] lg:items-end ${
          open ? "mt-4 grid" : "hidden"
        }`}
        id={`${fieldId}-fields`}
      >
        <DestinationField chrome={chrome} />
        <DateRangeField chrome={chrome} today={today} />
        <GuestsField chrome={chrome} />

        {/* `field` size, so the control ends level with the fields beside it
            rather than 4px short of them. */}
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
