import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
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
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control px-5 text-small font-medium transition-colors";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "border border-ink text-ink hover:bg-surface-alt",
  ghost: "text-ink underline-offset-4 hover:underline",
};

/** Replaces the variant outright. Appending it instead would leave two
 *  backgrounds and two text colours on one element, with stylesheet order
 *  deciding the winner rather than the code. */
const UNAVAILABLE = "bg-border text-muted pointer-events-none";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

function classes(
  variant: ButtonVariant,
  fullWidth: boolean,
  available: boolean,
): string {
  return [
    BASE,
    available ? `${VARIANTS[variant]} ${FOCUS}` : UNAVAILABLE,
    fullWidth ? "w-full" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  children,
  variant = "primary",
  href,
  fullWidth = false,
  disabled = false,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
}: ButtonProps) {
  const inert = href === null && !disabled;
  const className = classes(variant, fullWidth, !disabled && !inert);

  /**
   * An explicitly absent destination. DESIGN-SYSTEM ch. 6.1 asks for muted and
   * non-interactive, so the label stays and cards in a row keep equal heights.
   * It is deliberately not hidden from assistive technology: the text is still
   * information, it simply is not something to act on, and there is no control
   * here to announce as unavailable.
   */
  if (inert) {
    return <span className={className}>{children}</span>;
  }

  if (href && !disabled) {
    return (
      <a aria-label={ariaLabel} className={className} href={href}>
        {children}
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
      {children}
    </button>
  );
}
