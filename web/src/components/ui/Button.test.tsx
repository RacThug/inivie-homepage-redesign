// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders a button element when there is no destination", () => {
    render(<Button>Enquire</Button>);

    expect(screen.getByRole("button", { name: "Enquire" })).toBeInTheDocument();
  });

  it("renders a link when given a destination", () => {
    render(<Button href="https://inivie.com/villa">View villa</Button>);

    expect(screen.getByRole("link", { name: "View villa" })).toHaveAttribute(
      "href",
      "https://inivie.com/villa",
    );
  });

  it("calls its handler when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Enquire</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Enquire" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("meets the 44 by 44 minimum hit area required by RS2", () => {
    render(<Button>Enquire</Button>);

    // Both axes. Horizontal padding alone leaves a short label under 44px.
    expect(screen.getByRole("button")).toHaveClass("min-h-11", "min-w-11");
  });

  describe("variants", () => {
    it("carries the measured accent foreground on the primary fill", () => {
      render(<Button>Enquire</Button>);
      const button = screen.getByRole("button");

      // White on accent reaches only 2.39 to 1, so DESIGN-SYSTEM ch. 2.2
      // resolves accented controls to ink text via the on-accent token.
      expect(button).toHaveClass("bg-accent", "text-on-accent");
    });

    it("renders the secondary variant as an outline", () => {
      render(<Button variant="secondary">Enquire</Button>);

      expect(screen.getByRole("button")).toHaveClass("border-ink", "text-ink");
    });

    it("renders the ghost variant as text only", () => {
      render(<Button variant="ghost">Enquire</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("text-ink");
      expect(button).not.toHaveClass("bg-accent");
    });

    /**
     * The filled ink pill PRD ch. 6.2 asks for on Featured Properties. It sits
     * one step below the accent fill so a section control never competes with
     * a card's call to action.
     */
    it("renders the ink variant as a filled pill carrying surface text", () => {
      render(<Button variant="ink">View All Family</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-ink", "text-surface");
      expect(button).not.toHaveClass("bg-accent");
    });
  });

  describe("disabled", () => {
    it("replaces the variant styling rather than layering over it", () => {
      const { container } = render(<Button disabled>Enquire</Button>);

      expect(container.firstElementChild).toHaveClass(
        "bg-border",
        "text-muted",
      );
      expect(container.firstElementChild).not.toHaveClass("bg-accent");
    });

    it("marks the control disabled and drops its handler", async () => {
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Enquire
        </Button>,
      );
      const button = screen.getByRole("button");

      expect(button).toBeDisabled();
      await userEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("ignores a destination, so a disabled control is never a live link", () => {
      render(
        <Button disabled href="https://inivie.com/villa">
          View villa
        </Button>,
      );

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("inert, when the destination is known to be absent", () => {
    /**
     * DESIGN-SYSTEM ch. 6.1: when `cta_url` is null the button renders
     * visually muted and non-interactive, and is never a link to nowhere. A
     * null destination is the API saying there is no link, which is different
     * from the prop being absent because the control is an ordinary button.
     */
    it("renders neither a link nor a control", () => {
      render(<Button href={null}>View villa</Button>);

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("keeps the label readable rather than erasing it", () => {
      const { container } = render(<Button href={null}>View villa</Button>);
      const inert = container.firstElementChild;

      // ch. 6.1 asks for muted and non-interactive, not removed. The label is
      // still information; there is simply nothing here to act on.
      expect(inert).toHaveTextContent("View villa");
      expect(inert).not.toHaveAttribute("aria-hidden");
      expect(inert).toHaveClass("pointer-events-none");
    });

    /**
     * The unavailable treatment replaces the variant rather than being
     * appended to it. Appending left `bg-accent` beside `bg-border` and
     * `text-on-accent` beside `text-muted`, so which one rendered came down to
     * the order Tailwind happened to emit the utilities in.
     */
    it("carries the muted fill only, with no variant styling left behind", () => {
      const { container } = render(<Button href={null}>View villa</Button>);
      const inert = container.firstElementChild;

      expect(inert).toHaveClass("bg-border", "text-muted");
      expect(inert).not.toHaveClass("bg-accent");
      expect(inert).not.toHaveClass("text-on-accent");
      expect(inert).not.toHaveClass("hover:bg-accent-hover");
    });

    it("carries no focus ring, since there is nothing to focus", () => {
      const { container } = render(<Button href={null}>View villa</Button>);

      expect(container.firstElementChild?.className).not.toContain(
        "focus-visible:",
      );
    });

    it("is not reachable by keyboard", async () => {
      render(<Button href={null}>View villa</Button>);

      await userEvent.tab();

      expect(document.body).toHaveFocus();
    });
  });

  it("spans the full width only when asked to", () => {
    const { rerender } = render(<Button>Enquire</Button>);
    expect(screen.getByRole("button")).not.toHaveClass("w-full");

    rerender(<Button fullWidth>Enquire</Button>);
    expect(screen.getByRole("button")).toHaveClass("w-full");
  });
});
