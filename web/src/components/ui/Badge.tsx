import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
}

/**
 * A small marker, used over imagery for the property category. The surface sits
 * just short of opaque so it reads as part of the photograph while keeping ink
 * text at full contrast against it.
 */
export function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-flex items-center rounded-control bg-surface/95 px-2.5 py-1 text-small font-medium text-ink">
      {children}
    </span>
  );
}
