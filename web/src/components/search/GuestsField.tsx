"use client";

import { useState } from "react";

import { FieldPopover, type FieldChrome } from "@/components/ui/FieldPopover";
import { GUESTS, SEARCH_PANEL } from "@/content/hero";

/**
 * How many people the stay is for.
 *
 * A stepper rather than a list, because the range is small, contiguous and
 * ordered: a nine row menu to move from two to three is a menu that exists to
 * be closed again. The count is also announced on change, since the number is
 * the whole content of this control and it sits between two buttons that would
 * otherwise say only "more" and "fewer".
 */
/** A true minus sign, not a hyphen: a hyphen sits high and short beside a
 *  plus and reads as a dash rather than as the operation's other half. */
const MINUS = "−";

export function GuestsField({ chrome }: { chrome: FieldChrome }) {
  const [guests, setGuests] = useState<number>(GUESTS.default);

  return (
    <>
      <input name="adults" type="hidden" value={guests} />

      <FieldPopover
        chrome={chrome}
        icon={<GuestIcon />}
        label={SEARCH_PANEL.guests}
        panelClassName="sm:w-full sm:min-w-56"
        value={`${guests} ${guests === 1 ? "guest" : "guests"}`}
      >
        {() => (
          <div className="flex items-center justify-between gap-4 px-1 py-1">
            <span className="text-small text-ink">{SEARCH_PANEL.guests}</span>

            <div className="flex items-center gap-1">
              <Step
                disabled={guests <= GUESTS.min}
                label="Fewer guests"
                onClick={() => setGuests((count) => count - 1)}
                symbol={MINUS}
              />
              <output
                aria-live="polite"
                className="w-10 text-center text-body font-medium tabular-nums text-ink"
              >
                {guests}
              </output>
              <Step
                disabled={guests >= GUESTS.max}
                label="More guests"
                onClick={() => setGuests((count) => count + 1)}
                symbol="+"
              />
            </div>
          </div>
        )}
      </FieldPopover>
    </>
  );
}

function Step({
  disabled,
  label,
  onClick,
  symbol,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
  symbol: string;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-control border border-border text-body text-ink transition-colors hover:bg-surface-alt disabled:pointer-events-none disabled:text-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {symbol}
    </button>
  );
}

function GuestIcon() {
  return (
    <svg
      aria-hidden
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 16 16"
      width="16"
    >
      <circle cx="8" cy="5" r="2.75" />
      <path d="M2.5 14a5.5 5.5 0 0 1 11 0" />
    </svg>
  );
}
