import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "ink";

/**
 * The ground the control sits on. It changes the focus ring and the one
 * variant that carries no fill of its own, for the reason DESIGN-SYSTEM
 * ch. 6.5 gives about the footer: an `ink` ring is invisible on ink, and the
 * ring has to stay legible against what is behind it.
 */
export type ButtonTone = "light" | "dark";

/**
 * `field` matches the 48px of a form control, so a submit button ends level
 * with the inputs beside it. It is named for the row it belongs to rather
 * than for its height, because the height is ch. 6.8's, not this file's.
 */
export type ButtonSize = "default" | "field";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  /**
   * Where the control leads.
   *
   * Absent means this is an ordinary button. `null` is the API stating there
   * is no destination, which renders the inert treatment in DESIGN-SYSTEM
   * ch. 6.1 rather than a link to nowhere. The type mirrors `cta_url` in
   * docs/API-SPEC.md so a nullable field can be passed straight through.
   */
  href?: string | null;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  /** Only meaningful on the button element, which is the default rendering. */
  type?: "button" | "submit";
  "aria-label"?: string;
}

/**
 * Shared shape, so every variant and the inert state line up in a card row.
 * The 44 by 44 minimum is requirement RS2 rather than a visual preference, so
 * it is set on both axes instead of being left to the horizontal padding.
 */
const BASE =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control text-small font-medium transition-colors";

const SIZES: Record<ButtonSize, string> = {
  default: "",
  field: "h-12",
};

const VARIANTS: Record<ButtonVariant, Record<ButtonTone, string>> = {
  primary: {
    light: "px-5 bg-accent text-on-accent hover:bg-accent-hover",
    dark: "px-5 bg-accent text-on-accent hover:bg-accent-hover",
  },
  /**
   * An outlined pill, so hover has no fill of its own to darken and has to
   * come from somewhere else. It inverts: the border colour floods in and the
   * label flips to the ground it was drawn on.
   *
   * The tint this used to carry, `surface-alt` on `surface`, is a 1.25 to 1
   * step. That is the separator token doing a state's job, and on a real
   * screen it is not a state at all - a visitor moving a pointer over "All
   * restaurants" saw nothing move. Inverting uses the two colours already in
   * the variant rather than inventing a third, and `surface` on `ink` is
   * measured at 15.54 to 1 in palette.test.ts.
   */
  secondary: {
    light: "px-5 border border-ink text-ink hover:bg-ink hover:text-surface",
    dark: "px-5 border border-surface text-surface hover:bg-surface hover:text-ink",
  },
  /**
   * A text link, so it carries no horizontal padding: a button's inset would
   * push it out of line with the paragraph it follows, and there is no fill
   * here for that inset to be inside of.
   *
   * On ink it is `gold`, the one colour that carries text on that ground at
   * 6.87 to 1. `ink` there would disappear.
   *
   * The affordance is at rest, not on hover. Underline-on-hover leaves "About
   * us" indistinguishable from the paragraph above it until a pointer happens
   * to cross it, and a touch screen has no pointer to cross it with: the link
   * is invisible as a link for the whole time anyone is reading. So the rule
   * is always drawn and the chevron is always there, and hover deepens the
   * rule and nudges the chevron rather than conjuring either one.
   *
   * A named group, because a property card sets a plain `group` for its image
   * scale and an unnamed `group-hover:` here would fire whenever the card
   * beneath the pointer did.
   */
  ghost: {
    light: "group/ghost text-ink",
    dark: "group/ghost text-gold",
  },
  /**
   * A filled ink pill, for a section's own secondary control. PRD ch. 6.2 asks
   * for one on Featured Properties, deliberately quieter than the accent fill
   * a card's call to action carries so the two do not compete.
   *
   * Hover lightens to `ink-muted` rather than to an unnamed shade: it is the
   * one declared colour between ink and the page, and `surface` on it is
   * measured at AA in palette.test.ts rather than assumed.
   */
  ink: {
    light: "px-5 bg-ink text-surface hover:bg-ink-muted",
    dark: "px-5 bg-ink text-surface hover:bg-ink-muted",
  },
};

/** Replaces the variant outright. Appending it instead would leave two
 *  backgrounds and two text colours on one element, with stylesheet order
 *  deciding the winner rather than the code. */
const UNAVAILABLE = "px-5 bg-border text-muted pointer-events-none";

const FOCUS: Record<ButtonTone, string> = {
  light:
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
  dark: "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface",
};

/**
 * Resting and hovered underline for the ghost variant, per ground.
 *
 * `muted` is the resting rule on a light surface. It is a decorative use of a
 * token that may never carry text (DESIGN-SYSTEM ch. 2.2), which is exactly
 * what a 2px rule is, and it is the quietest colour on the page that is still
 * unmistakably drawn. `border` was the other candidate and is the same 1.25 to
 * 1 that made the old secondary hover invisible.
 *
 * It sits on an inner span rather than on the control, so the chevron beside
 * it is not underlined too.
 */
const GHOST_UNDERLINE: Record<ButtonTone, string> = {
  light:
    "underline decoration-muted decoration-2 underline-offset-4 transition-[text-decoration-color] group-hover/ghost:decoration-ink",
  dark: "underline decoration-gold/50 decoration-2 underline-offset-4 transition-[text-decoration-color] group-hover/ghost:decoration-gold",
};

/**
 * The chevron that ends a ghost link.
 *
 * `-ml-1` against the control's own `gap-2`, which is spacing for a pair of
 * words and too wide between a label and the mark that belongs to it.
 *
 * Decorative: the link already says where it goes, and "About us chevron
 * right" is not a better announcement than "About us".
 */
function GhostChevron() {
  return (
    <svg
      aria-hidden
      className="-ml-1 flex-none transition-transform group-hover/ghost:translate-x-0.5"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 16 16"
      width="14"
    >
      <path d="M6 3.5L10.5 8L6 12.5" />
    </svg>
  );
}

function classes(
  variant: ButtonVariant,
  tone: ButtonTone,
  size: ButtonSize,
  fullWidth: boolean,
  available: boolean,
): string {
  return [
    BASE,
    SIZES[size],
    available ? `${VARIANTS[variant][tone]} ${FOCUS[tone]}` : UNAVAILABLE,
    fullWidth ? "w-full" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  children,
  variant = "primary",
  tone = "light",
  size = "default",
  href,
  fullWidth = false,
  disabled = false,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
}: ButtonProps) {
  const inert = href === null && !disabled;
  const available = !disabled && !inert;
  const className = classes(variant, tone, size, fullWidth, available);

  /**
   * The ghost affordance is part of the variant, not of what a caller passes
   * in, so callers keep writing `<Button variant="ghost">About us</Button>`.
   *
   * It is dropped when the control is unavailable: `UNAVAILABLE` replaces the
   * variant outright, so an inert ghost is no longer a text link and an
   * underline pointing at nothing would be the affordance lying.
   */
  const content =
    variant === "ghost" && available ? (
      <>
        <span className={GHOST_UNDERLINE[tone]}>{children}</span>
        <GhostChevron />
      </>
    ) : (
      children
    );

  /**
   * An explicitly absent destination. DESIGN-SYSTEM ch. 6.1 asks for muted and
   * non-interactive, so the label stays and cards in a row keep equal heights.
   * It is deliberately not hidden from assistive technology: the text is still
   * information, it simply is not something to act on, and there is no control
   * here to announce as unavailable.
   */
  if (inert) {
    return <span className={className}>{content}</span>;
  }

  if (href && !disabled) {
    return (
      <a aria-label={ariaLabel} className={className} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button
      aria-label={ariaLabel}
      className={className}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {content}
    </button>
  );
}
