/**
 * The two date shapes this project uses, and nothing else.
 *
 * `Intl` rather than a formatting library: the only thing needed here is a
 * spelled out month, and NN/G's date input guidance asks for that precisely
 * because `10/11/2016` reads as two different days either side of the
 * Atlantic. `date-fns` arrives as a dependency of the calendar, but importing
 * a package this file does not declare is how a transitive dependency becomes
 * a broken build the day the calendar drops it.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

const DISPLAY = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const DISPLAY_SAME_YEAR = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

/** What the booking system reads, and what a `date` input reads and writes. */
export function toIso(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Midnight today, so a comparison against it is a comparison of days. */
export function startOfToday(now: number): Date {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today;
}

export function formatDay(date: Date): string {
  return DISPLAY.format(date);
}

/**
 * A stay as one phrase. The year is written once when both ends share it,
 * which is the common case and the one where repeating it reads as noise.
 */
export function formatStay(from: Date, to: Date | undefined): string {
  if (!to) return formatDay(from);

  return from.getFullYear() === to.getFullYear()
    ? `${DISPLAY_SAME_YEAR.format(from)} - ${DISPLAY.format(to)}`
    : `${DISPLAY.format(from)} - ${DISPLAY.format(to)}`;
}

/** The label a stay's length carries, for the phrase under the trigger. */
export function nightsBetween(from: Date, to: Date): number {
  return Math.round(
    (startOfToday(to.getTime()).getTime() -
      startOfToday(from.getTime()).getTime()) /
      DAY_MS,
  );
}
