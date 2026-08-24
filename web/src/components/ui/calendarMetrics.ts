/**
 * The calendar's geometry, in a module that pulls no library with it.
 *
 * `Calendar` is loaded on demand: `react-day-picker` is 32KB gzipped and no
 * visitor has it in front of them until they open the stay field, so it does
 * not belong in the bundle the homepage route ships (PRD ch. 8.2 budgets this
 * project's own code at 50KB). `CalendarSkeleton` holds its place, and
 * has to be the same size to the pixel or it causes the shift it exists to
 * prevent. Importing the sizes from `Calendar` would import `DayPicker` with
 * them and undo the split, so they live here and both files read them.
 */

/** One day. The cell carries the size, not the button inside it. */
export const CALENDAR_CELL = "h-10 w-10 sm:h-11 sm:w-11";

/** A weekday initial, above the grid. */
export const CALENDAR_WEEKDAY = "h-8 w-10 sm:w-11";

/** The month name, with the navigation arrows level with it. */
export const CALENDAR_CAPTION = "h-10";

/**
 * Rows the skeleton reserves.
 *
 * Six, which is the ceiling rather than the usual case: a month needs six
 * rows only when it starts late enough in the week, and most need five. The
 * ceiling is the stable number, exactly as `PropertyCardSkeleton` reserves
 * its clamped line counts rather than what one month of seed data happens to
 * use, and it errs toward a panel that shrinks rather than one that grows
 * under a pointer already on its way to a date.
 */
export const CALENDAR_WEEK_ROWS = 6;
