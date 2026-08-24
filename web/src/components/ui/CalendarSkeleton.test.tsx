// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CALENDAR_CELL,
  CALENDAR_WEEK_ROWS,
} from "@/components/ui/calendarMetrics";

import { CalendarSkeleton } from "./CalendarSkeleton";

/**
 * `Calendar` is fetched the first time somebody opens the stay field, so this
 * is what fills the panel in the meantime. It is only worth having if it is
 * the same size as what follows it, which is why both read their metrics from
 * `calendarMetrics.ts`: the assertions below are on that agreement, not on
 * numbers copied into a test.
 */
describe("CalendarSkeleton", () => {
  it.each([[1], [2]])("reserves a full %s month grid", (months) => {
    const { container } = render(<CalendarSkeleton months={months} />);

    // Every utility on the cell, as one selector. The colons in the
    // breakpoint variants are escaped: they are part of the class name here,
    // not the pseudo-class syntax a selector would otherwise read them as.
    const cells = container.querySelectorAll(
      CALENDAR_CELL.split(" ")
        .map((utility) => `.${CSS.escape(utility)}`)
        .join(""),
    );

    expect(cells).toHaveLength(months * CALENDAR_WEEK_ROWS * 7);
  });

  it("says nothing, because there is nothing here to read", () => {
    const { container } = render(<CalendarSkeleton months={1} />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
