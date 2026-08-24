import {
  CALENDAR_CAPTION,
  CALENDAR_CELL,
  CALENDAR_WEEK_ROWS,
  CALENDAR_WEEKDAY,
} from "@/components/ui/calendarMetrics";

interface CalendarSkeletonProps {
  /** The same count `Calendar` is about to be given, so the panel that opens
   *  is the width it will still be a moment later. */
  months: number;
}

/**
 * The calendar's shape, while the calendar itself is on its way.
 *
 * `Calendar` is loaded on demand, so on a slow connection there is a moment
 * between the panel opening and the grid arriving. A panel that opens empty
 * and then grows moves the date somebody is already reaching for, so this
 * stands in at the same size, built from the same metrics
 * (`calendarMetrics.ts`) rather than from numbers chosen to look close.
 *
 * Hidden from assistive technology: there is nothing here to read, and focus
 * has not moved into the panel yet.
 */
export function CalendarSkeleton({ months }: CalendarSkeletonProps) {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-5 text-ink sm:flex-row sm:gap-6"
    >
      {Array.from({ length: months }, (_, month) => (
        <div className="space-y-2" key={month}>
          <div
            className={`${CALENDAR_CAPTION} flex items-center justify-center`}
          >
            <span className="h-4 w-28 rounded-control bg-border" />
          </div>

          <div>
            <div className="flex">
              {Array.from({ length: 7 }, (_, day) => (
                <div
                  className={`${CALENDAR_WEEKDAY} flex items-center justify-center`}
                  key={day}
                >
                  <span className="h-2.5 w-5 rounded-control bg-border" />
                </div>
              ))}
            </div>

            {Array.from({ length: CALENDAR_WEEK_ROWS }, (_, week) => (
              <div className="flex" key={week}>
                {Array.from({ length: 7 }, (_, day) => (
                  <div className={`${CALENDAR_CELL} p-1`} key={day}>
                    <span className="block h-full w-full rounded-control bg-surface-alt" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
