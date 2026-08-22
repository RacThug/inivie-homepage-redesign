import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

/**
 * The one horizontal rhythm on the page. DESIGN-SYSTEM ch. 4.1: 1280px wide,
 * 20px of side padding on mobile and 40px from the desktop breakpoint.
 */
export function Container({ children }: ContainerProps) {
  return (
    <div className="mx-auto w-full max-w-page px-5 lg:px-10">{children}</div>
  );
}
