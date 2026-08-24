"use client";

import { DayPicker, type DateRange } from "react-day-picker";

import {
  CALENDAR_CAPTION,
  CALENDAR_CELL,
  CALENDAR_WEEKDAY,
} from "@/components/ui/calendarMetrics";

/**
 * `react-day-picker` in this project's palette.
 *
 * The library's own stylesheet is deliberately not imported. Every class below
 * is supplied instead, so the calendar is built out of the same tokens as the
 * rest of the page and there is no second source of colour to keep in step
 * with `globals.css`.
 *
 * The endpoints of a range are `ink` filled with `surface` text, not `accent`.
 * Accent reaches 2.39 to 1 on a light ground (DESIGN-SYSTEM ch. 2.3) and a
 * selected day is a day that has to stay readable.
 */

/**
 * The cell carries the size, not the button inside it.
 *
 * A month does not start on a Monday, so the leading cells of its first week
 * are empty. With the width on the button those cells collapsed to nothing and
 * every row slid left, which drew 1 August 2026 under Monday when it is a
 * Saturday.
 *
 * The size itself comes from `calendarMetrics.ts`, which `CalendarSkeleton`
 * reads too: this file is loaded on demand and the skeleton holds its place
 * until it lands, so the two have to agree by construction.
 */
const CELL = `${CALENDAR_CELL} p-0`;

const DAY = "h-full w-full rounded-control text-small transition-colors";

interface CalendarProps {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  /** Everything before this is unreachable, which is most of history. */
  fromDate: Date;
  months: number;
}

export function Calendar({
  selected,
  onSelect,
  fromDate,
  months,
}: CalendarProps) {
  return (
    <DayPicker
      classNames={{
        root: "relative text-ink",
        months: "flex flex-col gap-5 sm:flex-row sm:gap-6",
        month: "space-y-2",
        month_caption: `flex ${CALENDAR_CAPTION} items-center justify-center font-heading text-h3`,
        caption_label: "font-heading",
        // One pair of arrows for the whole calendar, level with the captions
        // beside them rather than floating over a month.
        nav: "absolute inset-x-0 top-0 z-10 flex h-10 items-center justify-between",
        button_previous:
          "inline-flex h-9 w-9 items-center justify-center rounded-control text-ink transition-colors hover:bg-surface-alt disabled:pointer-events-none disabled:text-border",
        button_next:
          "inline-flex h-9 w-9 items-center justify-center rounded-control text-ink transition-colors hover:bg-surface-alt disabled:pointer-events-none disabled:text-border",
        month_grid: "border-collapse",
        weekdays: "flex",
        weekday: `${CALENDAR_WEEKDAY} text-eyebrow font-medium uppercase text-ink-muted`,
        week: "flex",
        day: CELL,
        day_button: `${DAY} hover:bg-surface-alt`,
        // A stay is a span, so its ends are square where they meet the middle.
        range_start:
          "[&>button]:rounded-r-none [&>button]:bg-ink [&>button]:text-surface [&>button]:hover:bg-ink",
        range_end:
          "[&>button]:rounded-l-none [&>button]:bg-ink [&>button]:text-surface [&>button]:hover:bg-ink",
        range_middle:
          "[&>button]:rounded-none [&>button]:bg-surface-alt [&>button]:text-ink",
        selected: "",
        // Marks, never carries: an accent ring on a label that keeps its colour.
        today: "[&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-accent",
        disabled: "[&>button]:text-border [&>button]:pointer-events-none",
        outside: "invisible",
        hidden: "invisible",
      }}
      disabled={{ before: fromDate }}
      // A stay that ends the day it starts is not a stay, so a range is at
      // least two days: one night.
      min={2}
      mode="range"
      numberOfMonths={months}
      onSelect={onSelect}
      selected={selected}
      showOutsideDays={false}
      startMonth={fromDate}
      weekStartsOn={1}
    />
  );
}
