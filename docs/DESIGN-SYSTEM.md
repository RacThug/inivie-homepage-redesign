# Design System - iNi ViE Hospitality Homepage Redesign

| Field | Value |
| --- | --- |
| Document type | Design System Specification |
| Version | 1.0 |
| Date | 21 August 2026 |
| Status | Living document. Expected to change during implementation |

**Scope of this document.** Visual tokens and their application: colour, typography, spacing, radius, elevation, motion, breakpoints, and the visual specification of shared components.

Related: [PRD.md](./PRD.md) ch. 6 for what each section must communicate, [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md) ch. 4 for how components are composed.

---

## 1. Design Intent

The palette and type choices are derived from the live inivie.com so the redesign still reads as the same brand rather than a different company. What changes is the application: more disciplined spacing, a tighter type scale, and a much more restrained use of the accent colour.

Five principles govern every decision here. They are stated in PRD ch. 6.3 and repeated as constraints:

1. Photography leads, copy supports.
2. One spacing rhythm across the whole page.
3. One primary action per section.
4. Measure capped at roughly 65 characters.
5. Accent colour reserved for actions and markers.

---

## 2. Colour

### 2.1 Tokens

| Token | Hex | Usage |
| --- | --- | --- |
| `ink` | `#1C2434` | Primary text, dark surfaces, footer |
| `ink-muted` | `#4A5468` | Secondary text |
| `accent` | `#FF8737` | Primary buttons, active links, markers |
| `accent-hover` | `#E45826` | Hover and pressed states |
| `gold` | `#C9A779` | Luxury accent, dividers, eyebrow labels |
| `surface` | `#FFFFFF` | Card backgrounds |
| `surface-alt` | `#F7F7F5` | Alternating section backgrounds |
| `border` | `#E4E6EA` | Borders and separators |
| `muted` | `#AAB1BB` | Placeholder and disabled text |

`ink`, `accent`, and `gold` are taken directly from production. `ink-muted`, `surface-alt`, and `border` are additions, because production has no consistent secondary text or surface token and the page reads flatter for it.

### 2.2 Contrast requirements

Every text and background pairing must meet WCAG AA, at least 4.5 to 1 for body text and 3 to 1 for large text.

| Pairing | Status |
| --- | --- |
| `ink` on `surface` | Passes comfortably |
| `ink-muted` on `surface` | Passes |
| `ink` on `surface-alt` | Passes |
| `surface` on `ink` | Passes |
| `muted` on `surface` | **Decorative and disabled states only.** Must never carry meaning |
| `surface` on `accent` | **Must be measured before use.** White on a mid orange is the most likely failure in this palette. If it does not reach 4.5 to 1, accented buttons use `ink` text instead |

The last row is a known risk, not an oversight. It is resolved by measurement during D3, not by assumption.

### 2.3 Accent discipline

`accent` appears on: the primary button, the active navigation item, and small markers such as a rating star. It does not appear as a section background, a large fill, or a decorative shape. When a section needs emphasis it uses `ink` as a dark panel, not orange.

---

## 3. Typography

### 3.1 Families

| Family | Role | Loading |
| --- | --- | --- |
| Poppins | Headings | `next/font/google`, latin subset, `display: swap` |
| Inter | Body, labels, UI | `next/font/google`, latin subset, `display: swap` |
| Great Vibes | Optional decorative accent | Loaded only if actually used |

Self hosting through `next/font` removes both layout shift and any runtime third party request, which directly serves the performance targets in PRD ch. 8.2.

### 3.2 Scale

| Role | Family and weight | Mobile | Desktop |
| --- | --- | --- | --- |
| H1, hero | Poppins Medium | 34px / 40 | 46px / 52 |
| H2, section | Poppins Medium | 28px / 36 | 34px / 42 |
| H3, card title | Poppins Medium | 18px / 26 | 20px / 28 |
| Body | Inter Regular | 15px / 24 | 16px / 26 |
| Small, labels | Inter Medium | 13px / 18 | 13px / 18 |
| Eyebrow | Inter Medium, uppercase, 0.08em tracking | 12px / 16 | 12px / 16 |

The H1 and H2 sizes match production, which already reads well. The rest is tightened into a consistent scale, because production mixes several unrelated sizes.

### 3.3 Measure

Paragraphs are capped at roughly 65 characters, applied as a max width on the text container rather than on the section, so the section can stay full width while the copy inside stays readable.

---

## 4. Spacing, Radius, and Elevation

### 4.1 Spacing

A 4px scale, using Tailwind's default steps. Arbitrary values are not permitted for spacing.

| Context | Mobile | Desktop |
| --- | --- | --- |
| Section vertical padding | 64px | 96px |
| Container max width | - | 1280px |
| Container side padding | 20px | 40px |
| Grid gap between cards | 20px | 32px |
| Heading to body | 12px | 16px |
| Section header to content | 32px | 48px |

### 4.2 Radius

| Element | Radius |
| --- | --- |
| Cards, images inside cards | 12px |
| Buttons, inputs, badges | 8px |
| Full round | Avatars and icon buttons only |

### 4.3 Elevation

Two levels only.

| Level | Use |
| --- | --- |
| Rest | A soft, low opacity shadow on cards |
| Raised | Slightly larger and slightly darker, on card hover |

No heavy or coloured shadows. Depth comes from imagery and spacing, not from drop shadows.

---

## 5. Motion

| Property | Value |
| --- | --- |
| Duration | 200ms |
| Easing | `ease-out` |
| Applies to | Hover, focus, colour, transform |
| Scroll entrance | Fade plus a small upward translate, at most 12px |

All animation is disabled under `prefers-reduced-motion: reduce`. This is a hard requirement, not a nicety, because vestibular sensitivity is an accessibility concern rather than a preference.

---

## 6. Component Specifications

### 6.1 Property card

Implements the information requirements in PRD ch. 6.2. This section covers only visual treatment.

| Element | Treatment |
| --- | --- |
| Image | 4:3 aspect ratio, `object-cover`, 12px radius, scales to 1.04 on card hover with the overflow clipped |
| Category badge | Overlaid at the top left of the image, `surface` background at high opacity, `ink` text, small label size |
| Rating | Top right of the content area. A `gold` star icon and a one decimal value in small size |
| Title | H3 scale, `ink`, clamped to 2 lines |
| Location | Small size, `ink-muted`, preceded by a pin icon at 16px |
| Description | Body size, `ink-muted`, clamped to 3 lines |
| Price | Body size. The amount in `ink` medium weight, the "per night" qualifier in `ink-muted` |
| Button | Full width on mobile, auto width on desktop. `accent` background with text colour resolved per ch. 2.2 |
| Card | `surface` background, 1px `border`, 12px radius, rest elevation, raised on hover |

**Equal height rule.** Cards in a row must be the same height regardless of content length. Achieved by clamping the title and description and by pinning the button to the bottom of the card, not by fixing a card height.

**Inert state.** When `cta_url` is null the button renders visually muted and non-interactive. It is never a link to nowhere.

### 6.2 Section header

Eyebrow label, then heading, then optional intro paragraph. On desktop a secondary link may sit right aligned on the heading row. On mobile that link moves below the content, because a right aligned link next to a wrapped heading looks broken at narrow widths.

### 6.3 Button

| Variant | Treatment |
| --- | --- |
| Primary | `accent` background, text per ch. 2.2, 8px radius, `accent-hover` on hover |
| Secondary | Transparent background, 1px `ink` border, `ink` text |
| Ghost | Text only in `ink`, underline on hover |
| Disabled | `muted` text on `border` background, no pointer events |

Minimum hit area 44 by 44 pixels on mobile, per requirement RS2.

### 6.4 Skeleton

The loading skeleton for the property grid renders three placeholder cards whose dimensions match the real card exactly, including image ratio and clamped line counts. A skeleton with different dimensions causes the layout shift it was meant to prevent.

---

## 7. Breakpoints and Responsive Rules

### 7.1 Breakpoints

| Name | Range | Reference devices |
| --- | --- | --- |
| Mobile | 320px to 639px | iPhone SE 375px, iPhone 14 390px |
| Tablet | 640px to 1023px | iPad Mini 768px, iPad Air 820px |
| Desktop | 1024px and up | Laptop 1440px, wide monitor 1920px |

Design mobile first. Every rule is written as a minimum width, never a maximum.

### 7.2 Layout behaviour

| Component | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Property grid | 1 column | 2 columns | 3 columns |
| Culinary and wellness grids | 1 column | 2 columns | 3 columns |
| Special offers | 1 column | 2 columns | 3 columns, first item spanning 2 |
| Navigation | Drawer | Drawer | Inline |
| Footer columns | 1 | 2 | 4 |
| Hero height | 70vh | 75vh | 85vh |

### 7.3 Non-negotiables

| ID | Rule |
| --- | --- |
| RS1 | No horizontal scroll at any width from 320px upward |
| RS2 | Touch targets at least 44 by 44 pixels on mobile |
| RS3 | Navigation collapses to a drawer below 1024px, with a focus trap and Escape to close |
| RS4 | Images carry per breakpoint `sizes`, so mobile never downloads desktop assets |
| RS5 | No clipped or overflowing text on the longest title in the seed data |
| RS6 | Manually verified at 375px, 768px, and 1440px before submission |

---

## 8. Verification

Before submission:

1. Contrast check every pairing in ch. 2.2, with the `surface` on `accent` result recorded explicitly.
2. axe DevTools with zero serious violations.
3. Visual pass at 375px, 768px, and 1440px, with screenshots kept for the README.
4. A reduced motion pass with the operating system setting enabled.
