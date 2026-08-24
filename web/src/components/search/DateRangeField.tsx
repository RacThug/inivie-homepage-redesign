"use client";

import { lazy, Suspense, useState } from "react";
import type { DateRange } from "react-day-picker";

import { CalendarSkeleton } from "@/components/ui/CalendarSkeleton";
import { FieldPopover, type FieldChrome } from "@/components/ui/FieldPopover";
import { SEARCH_PANEL } from "@/content/hero";
import { addDays, formatStay, nightsBetween, toIso } from "@/lib/dates";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * The grid, fetched the first time somebody opens this field.
 *
 * `react-day-picker` is 32KB gzipped against the 50KB PRD ch. 8.2 allows
 * this project's own code, so left in the route it would be two thirds of
 * the budget spent on a control most visits never open.
 * `FieldPopover` renders its children only while the panel is open, so the
 * import is not merely deferred: it is never requested at all unless the
 * field is used. The type import above survives the split, being erased.
 *
 * `lazy` rather than `next/dynamic`, because the fallback has to be told how
 * many months it is standing in for, and `next/dynamic` gives its `loading`
 * component no props.
 */
const Calendar = lazy(async () => ({
  default: (await import("@/components/ui/Calendar")).Calendar,
}));

interface DateRangeFieldProps {
  chrome: FieldChrome;
  /** Midnight today, passed in rather than read here: the homepage is
   *  prerendered, and a date computed while rendering would be the date the
   *  build ran and would still be that date a month later. */
  today: Date;
}

/**
 * One field for the whole stay, replacing the two `date` inputs that were here.
 *
 * Two fields made the visitor hold the first date in their head while choosing
 * the second, and neither could show the other: a native `date` input cannot
 * draw two months, cannot tint the nights between two days, and renders as a
 * different control in every browser. In WebKit it renders as `2026-08-23`
 * with no calendar at all.
 *
 * The values still cross the seam as `checkin` and `checkout`, because the
 * booking system's query string is not ours to change. They are hidden inputs
 * so the panel stays a real GET form.
 */
export function DateRangeField({ chrome, today }: DateRangeFieldProps) {
  const [range, setRange] = useState<DateRange | undefined>({
    from: today,
    to: addDays(today, 1),
  });

  // Two months is the convention for a range, and it is also the only layout
  // that shows a stay crossing the end of a month without navigating.
  const months = useMediaQuery("(min-width: 640px)") ? 2 : 1;

  const from = range?.from;
  const to = range?.to;
  const nights = from && to ? nightsBetween(from, to) : 0;

  return (
    <>
      <input name="checkin" type="hidden" value={from ? toIso(from) : ""} />
      <input name="checkout" type="hidden" value={to ? toIso(to) : ""} />

      <FieldPopover
        chrome={chrome}
        detail={
          nights ? `${nights} ${nights === 1 ? "night" : "nights"}` : undefined
        }
        label={SEARCH_PANEL.dates}
        panelClassName="sm:w-max sm:max-w-[calc(100vw-2.5rem)]"
        value={from ? formatStay(from, to) : SEARCH_PANEL.datesEmpty}
      >
        {(close) => (
          <Suspense fallback={<CalendarSkeleton months={months} />}>
            <Calendar
              fromDate={today}
              months={months}
              onSelect={(next) => {
                setRange(next);
                // Both ends chosen and nothing left to say, so the panel gets
                // out of the way rather than waiting to be dismissed.
                if (next?.from && next.to) close();
              }}
              selected={range}
            />
          </Suspense>
        )}
      </FieldPopover>
    </>
  );
}
