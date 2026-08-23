/**
 * A short gold rule, set above a heading.
 *
 * DESIGN-SYSTEM ch. 2.1 gives gold exactly this job: rules, dividers and
 * markers, never text on a light surface. It is what the palette has instead
 * of an accent that could be used decoratively, and it is the one place on
 * the page where the brand's warmth appears without a photograph carrying it.
 *
 * Decorative, so it is hidden from assistive technology: it marks the start of
 * a block that already announces itself with a heading.
 */
export function GoldRule() {
  return <span aria-hidden className="block h-0.5 w-8 rounded-full bg-gold" />;
}
