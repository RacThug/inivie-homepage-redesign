/**
 * WCAG 2.2 contrast maths, used to hold the palette in DESIGN-SYSTEM ch. 2.2 to
 * its own accessibility requirement. Kept dependency free and pure so the
 * palette check is a test rather than a manual measurement somebody has to
 * remember to repeat.
 */

const HEX_PATTERN = /^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

type Channels = readonly [red: number, green: number, blue: number];

function parseHex(hex: string): Channels {
  if (!HEX_PATTERN.test(hex)) {
    throw new Error(
      `Expected a 3 or 6 digit hex colour, received ${JSON.stringify(hex)}`,
    );
  }

  const digits = hex.replace("#", "");
  const expanded =
    digits.length === 3
      ? digits
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : digits;

  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ];
}

/** Undoes the sRGB transfer function for a single 0-255 channel. */
function linearise(channel: number): number {
  const srgb = channel / 255;

  return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/**
 * Relative luminance as defined by WCAG 2.2, from 0 for black to 1 for white.
 */
export function relativeLuminance(hex: string): number {
  const [red, green, blue] = parseHex(hex);

  return (
    0.2126 * linearise(red) +
    0.7152 * linearise(green) +
    0.0722 * linearise(blue)
  );
}

/**
 * Contrast ratio between two colours, from 1 to 21. Symmetric: which colour is
 * the text and which is the background does not change the result.
 */
export function contrastRatio(a: string, b: string): number {
  const luminanceA = relativeLuminance(a);
  const luminanceB = relativeLuminance(b);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);

  return (lighter + 0.05) / (darker + 0.05);
}
