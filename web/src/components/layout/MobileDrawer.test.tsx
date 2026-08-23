// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MobileDrawer } from "./MobileDrawer";

function renderDrawer(overrides: { onClose?: () => void } = {}) {
  const onClose = overrides.onClose ?? vi.fn();

  const view = render(
    <MobileDrawer id="site-menu" onClose={onClose} open pathname="/stay" />,
  );

  return { ...view, onClose };
}

describe("MobileDrawer", () => {
  it("renders nothing when closed, so the trap cannot hold focus off screen", () => {
    render(<MobileDrawer id="site-menu" onClose={vi.fn()} open={false} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("announces itself as a modal dialog", () => {
    renderDrawer();

    const panel = screen.getByRole("dialog", { name: "Site menu" });
    expect(panel).toHaveAttribute("aria-modal", "true");
    expect(panel).toHaveAttribute("id", "site-menu");
  });

  it("locks the page behind it and releases the lock on close", () => {
    const { unmount } = renderDrawer();

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("closes on Escape", async () => {
    const { onClose } = renderDrawer();

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes when the area outside the panel is clicked", async () => {
    const { onClose, container } = renderDrawer();

    const scrim = container.querySelector('[aria-hidden="true"]');
    await userEvent.click(scrim!);

    expect(onClose).toHaveBeenCalledOnce();
  });

  describe("the focus trap", () => {
    it("wraps forward from the last item back to the first", async () => {
      renderDrawer();

      const panel = screen.getByRole("dialog");
      const close = screen.getByRole("button", { name: "Close menu" });
      const last = within(panel).getByRole("link", { name: "Book Now" });

      last.focus();
      await userEvent.tab();

      expect(close).toHaveFocus();
    });

    it("wraps backward from the first item to the last", async () => {
      renderDrawer();

      const panel = screen.getByRole("dialog");
      const close = screen.getByRole("button", { name: "Close menu" });
      const last = within(panel).getByRole("link", { name: "Book Now" });

      close.focus();
      await userEvent.tab({ shift: true });

      expect(last).toHaveFocus();
    });
  });

  it("marks the current page without recolouring its label", () => {
    renderDrawer();

    const current = screen.getByRole("link", { name: "Stay" });

    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.firstElementChild).toHaveClass("border-accent");
  });

  it("gives every target the 44px minimum on both axes (RS2)", () => {
    renderDrawer();

    expect(screen.getByRole("button", { name: "Close menu" })).toHaveClass(
      "min-h-11",
      "min-w-11",
    );

    for (const link of within(
      screen.getByRole("navigation", { name: "Primary" }),
    ).getAllByRole("link")) {
      expect(link).toHaveClass("min-h-11");
    }
  });
});
