"use client";

import { useState } from "react";

import { FieldPopover } from "@/components/ui/FieldPopover";
import { PinIcon } from "@/components/ui/PinIcon";
import { DESTINATIONS, SEARCH_PANEL } from "@/content/hero";

/**
 * The destination, as a list this project styles rather than one the operating
 * system draws.
 *
 * A native `select` takes almost no styling and takes it differently per
 * engine: in WebKit this field rendered as a white pill with dark text on an
 * ink panel, ignoring every token it was given. Nine options is also few
 * enough that a list is simply quicker to read than a control that has to be
 * opened before it says what is in it.
 */
export function DestinationField() {
  const [value, setValue] = useState(DESTINATIONS[0].value);
  const chosen = DESTINATIONS.find((option) => option.value === value);

  return (
    <>
      <input name="city" type="hidden" value={value} />

      <FieldPopover
        icon={<PinIcon />}
        label={SEARCH_PANEL.destination}
        panelClassName="sm:max-h-72 sm:w-full sm:min-w-64 sm:overflow-y-auto"
        value={chosen?.label ?? value}
      >
        {(close) => (
          <ul className="space-y-0.5">
            {DESTINATIONS.map((option) => {
              const current = option.value === value;

              return (
                <li key={option.value}>
                  <button
                    aria-current={current ? "true" : undefined}
                    className={`flex min-h-11 w-full items-center rounded-control px-3 text-left text-small transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                      current
                        ? "bg-surface-alt font-medium text-ink"
                        : "text-ink hover:bg-surface-alt"
                    }`}
                    onClick={() => {
                      setValue(option.value);
                      close();
                    }}
                    type="button"
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </FieldPopover>
    </>
  );
}
