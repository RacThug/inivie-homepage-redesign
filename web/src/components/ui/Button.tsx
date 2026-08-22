import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
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
}

/** Shared shape, so every variant and the inert state line up in a card row. */
const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 text-small font-medium transition-colors";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "border border-ink text-ink hover:bg-surface-alt",
  ghost: "text-ink underline-offset-4 hover:underline",
};

const DISABLED = "bg-border text-muted pointer-events-none";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

function classes(
  variant: ButtonVariant,
  fullWidth: boolean,
  disabled: boolean,
): string {
  return [
    BASE,
    disabled ? DISABLED : VARIANTS[variant],
    disabled ? "" : FOCUS,
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
  ...props
}: ButtonProps) {
  const className = classes(variant, fullWidth, disabled);

  /**
   * An explicitly absent destination. The label stays so cards in a row keep
   * equal heights, but it is muted, unfocusable, and hidden from assistive
   * technology, because there is nothing here to act on.
   */
  if (href === null && !disabled) {
    return (
      <span aria-hidden="true" className={`${className} ${DISABLED}`}>
        {children}
      </span>
    );
  }

  if (href && !disabled) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button className={className} disabled={disabled} type="button" {...props}>
      {children}
    </button>
  );
}
