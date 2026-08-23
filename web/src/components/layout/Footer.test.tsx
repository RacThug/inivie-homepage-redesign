// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { COMPANY_LINKS, DEPARTMENTS, SOCIAL_LINKS } from "@/content/footer";

import { Footer } from "./Footer";

describe("Footer", () => {
  it("keeps all six contact routes reachable", () => {
    render(<Footer />);

    // Five desks plus the general line. Collapsing them into one "contact us"
    // would send a job applicant to the reservations team.
    const emails = [
      "info@inivie.com",
      ...DEPARTMENTS.map((desk) => desk.email),
    ];

    expect(emails).toHaveLength(6);

    for (const email of emails) {
      expect(screen.getByRole("link", { name: email })).toHaveAttribute(
        "href",
        `mailto:${email}`,
      );
    }
  });

  it("names every desk, so a visitor can tell which one is theirs", () => {
    render(<Footer />);

    for (const desk of DEPARTMENTS) {
      expect(screen.getByText(desk.name)).toBeInTheDocument();
    }
  });

  it("makes each published phone number dialable", () => {
    render(<Footer />);

    const numbered = DEPARTMENTS.filter((desk) => desk.phone);

    for (const desk of numbered) {
      expect(screen.getByRole("link", { name: desk.phone })).toHaveAttribute(
        "href",
        `tel:${desk.phone!.replace(/\s/g, "")}`,
      );
    }
  });

  it("carries the links the header no longer has room for", () => {
    render(<Footer />);

    for (const link of COMPANY_LINKS) {
      expect(screen.getByRole("link", { name: link.label })).toHaveAttribute(
        "href",
        link.href,
      );
    }

    // The B2B consultancy line specifically: dropped from the primary
    // navigation, not from the site.
    expect(
      screen.getByRole("link", { name: "Consultant (DP+, DP Construction)" }),
    ).toBeInTheDocument();
  });

  it("lists every social channel", () => {
    render(<Footer />);

    for (const social of SOCIAL_LINKS) {
      expect(screen.getByRole("link", { name: social.label })).toHaveAttribute(
        "href",
        social.href,
      );
    }
  });

  it("labels the newsletter field rather than relying on the placeholder", () => {
    render(<Footer />);

    // A placeholder disappears the moment someone types, which leaves a
    // screen reader user with an unlabelled input halfway through filling it.
    expect(screen.getByLabelText("Email address")).toHaveAttribute(
      "type",
      "email",
    );
  });

  it("carries the legal row", () => {
    render(<Footer />);

    expect(
      screen.getByRole("link", { name: "General Policy" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("2026 iNi ViE Hospitality. All Rights Reserved"),
    ).toBeInTheDocument();
  });

  it("uses gold for column headings, the one surface where gold may be text", () => {
    render(<Footer />);

    // Gold reaches 6.87 to 1 on ink and only 2.26 on a light surface, so this
    // is the single place in the design system it is allowed to carry text.
    expect(screen.getByText("Departments")).toHaveClass("text-gold");
  });
});
