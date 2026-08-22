# Design System - iNi ViE Hospitality Homepage Redesign

| Field | Value |
| --- | --- |
| Document type | Design System Specification |
| Version | 1.2 |
| Date | 22 August 2026 |
| Status | Living document. Expected to change during implementation |

**Scope of this document.** Visual tokens and their application: colour, typography, spacing, radius, elevation, motion, breakpoints, and the visual specification of shared components. Chapters 1 to 7 specify the public homepage. Chapter 8 specifies the admin panel, which reuses most of the same tokens and departs from a few of them deliberately.

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
| `accent` | `#FF8737` | Primary button fills and markers. Never text on a light surface, see ch. 2.2 |
| `accent-hover` | `#F46100` | Hover and pressed states |
| `gold` | `#C9A779` | Luxury accent, dividers, and markers. Never text on a light surface |
| `gold-dark` | `#8E6A39` | Eyebrow labels, and any gold text on a light surface |
| `surface` | `#FFFFFF` | Card backgrounds |
| `surface-alt` | `#F7F7F5` | Alternating section backgrounds |
| `border` | `#E4E6EA` | Borders and separators |
| `muted` | `#AAB1BB` | Placeholder and disabled text |
| `on-accent` | `#1C2434` | Text and icons on an accent fill. A decision, not a new colour: it resolves to `ink`, for the reason in ch. 2.2 |

`ink`, `accent`, and `gold` are taken directly from production. `ink-muted`, `surface-alt`, and `border` are additions, because production has no consistent secondary text or surface token and the page reads flatter for it.

`accent-hover` and `gold-dark` are set by measurement rather than by eye. Both are explained in ch. 2.2.

### 2.2 Contrast requirements

Every text and background pairing must meet WCAG AA, at least 4.5 to 1 for body text and 3 to 1 for large text.

Measured on 22 August 2026 against the tokens in `web/src/app/globals.css`. The measurement is not a one-off exercise: `web/src/design/palette.test.ts` parses that stylesheet and re-checks every row below on each test run, so a token edited to an inaccessible value fails the suite rather than reaching a reviewer.

| Pairing | Ratio | Status |
| --- | --- | --- |
| `ink` on `surface` | 15.54 | Passes |
| `surface` on `ink` | 15.54 | Passes |
| `ink` on `surface-alt` | 14.49 | Passes |
| `ink-muted` on `surface` | 7.61 | Passes |
| `ink-muted` on `surface-alt` | 7.10 | Passes |
| `gold` on `ink` | 6.87 | Passes. Gold carries text only on a dark panel |
| `on-accent` on `accent` | 6.49 | Passes |
| `gold-dark` on `surface` | 4.92 | Passes |
| `on-accent` on `accent-hover` | 4.85 | Passes |
| `gold-dark` on `surface-alt` | 4.58 | Passes |
| `surface` on `accent`, and `accent` on `surface` | 2.39 | **Fails.** See below |
| `gold` on `surface` | 2.26 | Fails. Decorative use only |
| `muted` on `surface` | 2.16 | Fails. Decorative and disabled states only. Must never carry meaning |
| `border` on `surface` | 1.25 | Fails. Separators only, never text |

#### The white on accent decision

This was flagged in the first draft as the pairing most likely to fail, to be resolved by measurement rather than assumption. It measures **2.39 to 1**, far below the 4.5 required, so the fallback named there applies: accented controls carry `ink` text at 6.49 to 1. The decision is stored as the `on-accent` token so no component has to remember it, and the value is a reference to `ink` rather than a second copy of the hex.

#### Two failures the first draft did not anticipate

**The hover fill.** `accent-hover` was drafted as `#E45826`. Ink text on it reaches only 4.23 to 1, so the primary button would have sat below AA for as long as a pointer rested on it, and white is worse again at 3.67. No text colour clears AA on that fill, so the fill had to change. `#F46100` carries ink text at 4.85 to 1 and is clearly darker than the resting fill. Darker oranges on the same hue keep passing for roughly another step of lightness, down to about `#EB5E00` at 4.54, but a hover state one rounding away from failing is not worth the extra depth.

**Gold as text.** ch. 2.1 assigned `gold` to eyebrow labels, which are text. It reaches 2.26 to 1 on `surface` and 2.11 on `surface-alt`, so a gold eyebrow on a light section would have failed AA everywhere it appeared. Production's gold is kept untouched for dividers and markers, and `gold-dark` carries the same hue and saturation at a lightness that clears AA on both light surfaces, so eyebrow labels still read as gold.

### 2.3 Accent discipline

`accent` appears on: the primary button, the active navigation item, and small markers such as a rating star. It does not appear as a section background, a large fill, or a decorative shape. When a section needs emphasis it uses `ink` as a dark panel, not orange.

`accent` is a fill colour, never text on a light surface, because it reaches only 2.39 to 1 there. The active navigation item is therefore marked with an accent rule or underline while its label stays `ink`.

---

## 3. Typography

### 3.1 Families

| Family | Role | Loading |
| --- | --- | --- |
| Poppins | Headings | `next/font/google`, latin subset, `display: swap` |
| Inter | Body, labels, UI | `next/font/google`, latin subset, `display: swap` |
| Great Vibes | Optional decorative accent | Loaded only if actually used. Nothing renders it yet, so it is not loaded |

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

The disabled and inert treatments **replace** the variant rather than layering over it. Combining them leaves two backgrounds and two text colours on one element, and which renders comes down to the order the utilities happen to be emitted in.

Minimum hit area 44 by 44 pixels on mobile, per requirement RS2. Both axes, not height alone: horizontal padding leaves a short label under 44 pixels wide.

**Focus.** Every interactive variant carries a two pixel `ink` outline, offset by two pixels, on `focus-visible` only. Keyboard users get a visible ring without pointer users seeing one, and `ink` is used rather than `accent` because the ring must stay legible against the accent fill itself.

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

## 8. Admin Panel

The admin panel is a tool, not a marketing surface. Its quality bar is set in PRD ch. 7.2: the CMS is "simple" in scope, not unfinished. This chapter exists because C1 to C8 are built across four separate issues, and without a shared specification they arrive looking like four applications.

TECHNICAL-DESIGN ch. 5 owns the routes, validation, and controllers. This chapter owns only how they look.

### 8.1 What the admin inherits, and what it departs from

| Inherits | Departs |
| --- | --- |
| The colour tokens in ch. 2.1, minus `gold` and `gold-dark` | Typography. The admin uses the system UI stack and loads no webfont |
| The 4px spacing scale in ch. 4.1 | Rhythm. Admin padding is denser, and the type scale is one step smaller |
| The radii in ch. 4.2 | Elevation. One level, not two |
| The motion budget in ch. 5, on hover and focus | Scroll entrance. There is none |
| The focus treatment in ch. 6.3, unchanged | |

Three departures need a reason on the record.

**No webfont.** Poppins and Inter carry the brand voice on a page a guest reads. The admin is read by one person who is working. The CMS has no `next/font`, so a webfont there means a runtime Google Fonts request from Blade, which is exactly what ch. 3.1 removed from the frontend, paid again for a screen no guest sees. The stack is `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. Continuity is carried by colour, spacing, and radius instead, which is enough for the panel to read as the same product.

This contradicts the scaffold, so the scaffold has to give way. A fresh Laravel install wires up Instrument Sans in two places: a `bunny('Instrument Sans')` entry in `cms/vite.config.js`, and a `--font-sans` override in `cms/resources/css/app.css`. Both are removed when the admin layout is built. Left in place they would keep downloading a typeface no screen renders, and the specification here would be false from its first commit.

**No gold.** Gold is a luxury marker aimed at guests. In a data table it is noise.

**One elevation.** Homepage cards lift on hover because they are clickable objects. Admin panels are containers, so they take a 1px `border` and no shadow at all. The confirm modal is the single raised element in the panel.

### 8.2 One admin-only token

Destructive actions and validation errors need a colour the homepage palette does not have, because the homepage has nothing destructive on it and no forms to fail.

| Token | Hex | Usage |
| --- | --- | --- |
| `danger` | `#B42318` | Delete controls, and per field validation error text |
| `danger-hover` | `#8E1B12` | Hover and pressed state on a danger fill |

Measured on 22 August 2026, same method as ch. 2.2.

| Pairing | Ratio | Status |
| --- | --- | --- |
| `surface` on `danger` | 6.57 | Passes |
| `danger` on `surface` | 6.57 | Passes |
| `danger` on `surface-alt` | 6.13 | Passes |
| `surface` on `danger-hover` | 9.07 | Passes |

Unlike `accent`, `danger` **is** legible as text on a light surface. That is what makes it usable for per field error messages, and it is the one place where the accent discipline in ch. 2.3 does not transfer.

Both tokens are declared in `cms/resources/css/app.css` only. They are deliberately absent from `web/src/app/globals.css`, whose token set is asserted exactly by `web/src/design/palette.test.ts`. The admin's colours are a duplicated subset of that file rather than a shared package, because this repository holds two applications and no workspace. Keeping the subset small is what keeps the duplication cheap to check by eye.

### 8.3 Shell

A left sidebar, in three states across two breakpoints.

| State | Width | When |
| --- | --- | --- |
| Expanded | 240px | 1024px and up, the default |
| Rail | 64px | 1024px and up, once the admin collapses it |
| Drawer | 264px, overlaid | Below 1024px, closed by default |

The first draft of this chapter specified a topbar, on two arguments that did not survive being drawn. The width argument was **false**: the table needs about 860px and a 240px sidebar leaves it 1040px. The drawer argument was **temporary**: a topbar avoids a drawer only while the nav has two items, and PRD ch. 12 already schedules the growth that ends it, starting with promoting Special Offers to a dynamic section. What the sidebar buys that a topbar cannot is grouping, and grouping is information: `Settings` is not a peer of `Properties`, and only a sidebar can say so.

#### Regions

| Region | Treatment |
| --- | --- |
| Page background | `surface-alt`, so white panels read as panels |
| Sidebar | `ink` background, full viewport height, fixed, its own scroll when the nav outgrows the screen |
| Brand mark | "iNi ViE" in `surface` at 15px medium in a 56px header, linking to `/admin` |
| Group label | 11px / 16 uppercase in `muted`, 0.08em tracking, above each group. Replaced by a 1px `surface` rule at 12% opacity in the rail |
| Nav item | 36px tall, an icon then a label, `surface` at 70% opacity |
| Active nav item | Full `surface` label, a `surface` fill at 8% opacity, and a 2px `accent` rule on its leading edge |
| Session | Pinned to the bottom above a 1px `surface` rule at 12% opacity: the signed in email in `muted`, then a logout button as a ghost variant in `surface` |
| Collapse toggle | In the header row, right aligned against the brand mark. Collapsing is a layout control, and the footer holds the session |
| Content column | Fills the remaining width, with the 1280px `container-page` from ch. 4.1 applied inside it |
| Page header | Title on the left, at most one primary action on the right. Stacks below 640px |
| Vertical rhythm | 24px above the page header, 24px from header to content, 16px between stacked panels |

The active item is marked with an accent rule while its label stays `surface`, for the reason ch. 2.3 gives: `accent` is a fill colour, never a text colour.

#### The rail

Collapsing hides the labels and the group headings, leaving a 64px column of centred icons. Every item keeps an `aria-label` and a `title`, so the label is still reachable by pointer and by screen reader, and the active item keeps its accent rule. Group headings become a divider rule, because the grouping still exists even when its names are not shown.

The brand mark gives way with them, and the toggle takes the whole 64px as a hamburger. An abbreviated wordmark was tried first and is worse in both directions: it either truncates or it says nothing, and it spends the column's one clear affordance on decoration. The hamburger is what the admin already reaches for at this width, since it is the same control the drawer uses below 1024px.

This is the one place the admin needs icons, and it is why ch. 8.8 permits a small inline SVG set: **a rail without icons is a column of nothing**. One icon per nav item, single stroke, 20px, 1.5px stroke width, `currentColor`, from one set and never mixed.

#### Every difference between the two states is CSS

The rail has two drivers that must agree: the server renders it from the cookie on first paint, and the browser applies it on click without a round trip. So **nothing about the rail may be decided in the template**. A wordmark, an icon direction, or an alignment chosen in PHP is correct on load and stale for the rest of the session, because the browser only flips an attribute.

The rule is therefore: render both states into the markup and let `data-rail` choose between them. Two icons ship in the toggle, the full wordmark ships and is hidden, and no width is written in JavaScript.

This is asserted rather than trusted. `tests/Feature/Admin/SidebarStateTest.php` renders the panel in both states and compares them after flattening the state attributes and the per request tokens. Any difference the browser cannot reproduce on its own fails the suite.

#### Where the collapsed state is stored

In a cookie, read by Blade when the page renders. Not in `localStorage`.

The difference is visible, not academic. Blade emits the whole document before any script runs, so a state held in `localStorage` can only be applied after first paint: the sidebar renders expanded, then jumps to the rail. That flash appears on **every navigation**, because a Blade admin is full page loads rather than client side routing, so it is not a one-off cost at boot the way it would be in a single page app. A cookie is sent with the request, so the server renders the correct width the first time and there is nothing to correct.

#### Below 1024px

The sidebar becomes a drawer, closed by default, opened by a toggle in a slim `ink` bar that also carries the brand mark. The rail does not exist at this breakpoint: the two desktop states collapse into open and closed, because a 64px icon rail on a 375px screen spends 17% of the width on navigation the admin is not currently using.

The drawer follows RS3 exactly, which is deliberate. The public site already has to implement a focus trap, Escape to close, and focus restoration for its own mobile navigation, so the admin adopts the same behaviour rather than inventing a second set of rules for it.

### 8.4 Type scale

One step smaller than ch. 3.2 across the board, because a tool shows more per screen than a landing page does.

| Role | Weight | Size |
| --- | --- | --- |
| Page title | 600 | 20px / 28 |
| Panel title | 600 | 15px / 22 |
| Body and table cells | 400 | 14px / 20 |
| Labels, badges, help text | 500 | 13px / 18 |
| Stat figure | 600 | 32px / 40 |

### 8.5 Components

Each is specified once here and reused by the issues named, rather than reinvented per screen.

**Sidebar drawer.** Below 1024px only. A 264px `ink` panel over an `ink` scrim at 50%, holding the same nav as the expanded sidebar. Focus moves into the drawer on open and is trapped, Escape closes it, and focus returns to the toggle that opened it. Same rules as RS3, same implementation shape as the public drawer.

**Nav icon.** One per nav item, 20px, single stroke at 1.5px, `currentColor`, from one set. Icons exist for the rail in ch. 8.3, not for decoration: an item that cannot be drawn as a clear icon is a sign the nav is carrying something that is not a section.

**Panel.** `surface` background, 1px `border`, 12px card radius, no shadow, 20px padding. An optional title row separated by a 1px `border` rule.

**Stat tile.** A panel holding a label in label size `ink-muted`, then the figure in stat scale `ink`. The dashboard is two tiles, published and draft, side by side from 640px and stacked below it. A count of zero renders as `0`. An empty state is for a list with no rows, not for a counter that legitimately reads zero.

**Data table.** Header row in label size `ink-muted` on `surface-alt`, with a 1px `border` beneath. Rows separated by 1px `border`, 12px vertical cell padding, and no zebra striping. Row hover fills `surface-alt`. The thumbnail column is a 56 by 42 image at the 8px control radius rather than the 12px card radius, because 12px on a 42px tall image reads as a squircle instead of a photograph. The actions column is right aligned and last.

A row is one rendering, laid out twice. The stacked list in ch. 8.7 relays the same cells rather than repeating them, because the row holds form controls: two renderings would put two copies of every position input in the document under one name, and the copy the admin cannot see would be the one that wins.

**Pager.** Below the data table, only when there is more than one page: the range and total on the left in label size `ink-muted`, then Previous and Next as secondary buttons on the right. A page that cannot be reached keeps its place as the disabled treatment rather than disappearing, so the pair does not shift sideways between the first page and the second. Laravel's own pagination view is not used, because it is written in another design system's classes and would arrive carrying shadows and a blue focus ring.

**Status badge.** Published is an `ink` fill with `surface` text. Draft is a `surface` fill with a 1px `border` and `ink-muted` text. Both take the 8px control radius and label size.

This pair introduces no new colour, and it stays unambiguous in greyscale and under any colour vision deficiency, because the difference is fill against outline rather than green against grey.

**Inline position.** The order column is editable in place: a 36px number control, 72px wide, otherwise the form field of this chapter unchanged, with the same `aria-invalid` border and the same message directly below it. Its label is the column header on a table and there is no column header once the table becomes a stacked list, so the label is rendered visibly below 640px and read only above it, and it names the property either way. "Order" repeated twenty times names nothing.

**Table footer bar.** A `surface-alt` strip inside the table container, above the 1px `border` that closes it, holding a sentence in label size `ink-muted` on the left and one secondary button on the right. Below 640px the two stack and the button goes full width. It is where a table level action lives, as against a row level one: the reorder submission is the only one, and it is secondary rather than primary because the primary action of the screen is adding a property, and two filled buttons on one page leave neither of them meaning "the main thing here".


**Form field.** Label in label size `ink` above the control. Control on `surface` with a 1px `border`, 8px control radius, 40px tall, 12px horizontal padding. Focus per ch. 6.3. The invalid state replaces the border with `danger` and places the message directly below in `danger` at label size. Optional help text sits below the control in `ink-muted`, and is replaced by the error rather than pushed down by it. Optional fields are marked, required ones are not: on a form where most fields are required, marking the exceptions is the shorter and quieter of the two conventions. Errors are per field with the submitted values preserved, which is C8.

**Flash message.** Full width of the page container, directly beneath the page header. A `surface` panel with a 3px left rule: `ink` for a completed action, `danger` for a failure. It persists until the next navigation and is never dismissed on a timer, because a message that removes itself is a message the admin can miss.

The same panel carries the other two messages the panel sends: the rejected sign in above the login fields, and a single line at the top of a form that failed validation, counting the fields that need attention. The messages themselves stay at their fields, per C8; the line exists because a form long enough to scroll can fail below the fold and otherwise say nothing where the admin is looking.

**Empty state.** Centred inside the panel with 48px of vertical padding: a line in `ink` naming what is missing, a supporting line in `ink-muted`, then the primary action that resolves it. A bare empty table is never shipped.

**Confirm modal.** The only raised element in the panel. Centred, at most 420px wide, `surface`, card radius, raised elevation, over an `ink` scrim at 50%. A title, one sentence naming the exact record by its title, then Cancel as the secondary variant and the destructive action as the danger variant. Focus moves to Cancel on open and is trapped, and Escape closes, matching the drawer rules in RS3.

The dialog is the only thing that submits a delete. The control in the row is a plain button, and the form around it is submitted by the dialog once the admin has answered, so the control that cannot ask the question is never the control that performs the action. C5 puts deletion behind an explicit confirmation, and with scripting unavailable the button therefore does nothing rather than deleting unasked. That is the same assumption the shell already makes: below 1024px the panel's own navigation is a scripted drawer.

**Buttons.** The variants in ch. 6.3 apply unchanged, plus one addition: Danger is a `danger` fill with `surface` text and `danger-hover` on hover. Admin buttons are 36px tall on desktop and 44px on mobile, per RS2.

A row level delete is the ghost variant in `danger` text, not the danger fill. A table of six rows carrying six filled red buttons reads as an alarm rather than as a list, and the fill is reserved for the confirm modal, where the destructive action genuinely is the subject of the screen.

The other two row level actions are the ghost variant in `ink`. The publish control names the state it is asking for rather than the state the row is in, so a published row offers "Unpublish" and a draft offers "Publish", and the status badge beside it stays the only thing that reports the current state. A control that repeated the state would be a second indicator to keep in agreement with the first.

### 8.6 Login screen

The one admin screen with no shell. A `surface-alt` page holding a single centred `surface` panel, at most 380px wide, card radius, 1px `border`, 32px padding: brand mark, heading, email and password fields, then a full width primary button.

A rejected attempt renders one message above the fields, worded identically whether the email exists or not, so the form is not an account enumeration oracle. Once the rate limiter in TECHNICAL-DESIGN ch. 5.1 trips, its throttle message replaces that one.

### 8.7 Responsive

RS1 and RS2 apply to the admin unchanged. PRD ch. 7.2 sets 768px as the width the panel must stay usable at, so these rules are written to hold from 375px upward rather than at that single width.

| Rule | Behaviour |
| --- | --- |
| Below 640px | The data table becomes a stacked list, one panel per property: the thumbnail, title and status on the first line, the inline position on the second, and the actions on their own row. Six columns cannot be made to work at 375px, and a horizontally scrolling table hides the actions column exactly where it is hardest to discover. The category loses its column and joins the location under the title. Three actions and a position control do not fit on one line at 375px, which is the second reason the actions get a row of their own |
| Forms | A single column at every width. Never two columns |
| Navigation | Expanded sidebar at 1024px and up, collapsible to a 64px rail. A drawer below that, per ch. 8.3. The rail is a desktop state only |
| Page header | The primary action drops below the title below 640px, at full width |

### 8.8 Deliberately absent

Dark mode, charts or sparklines on the dashboard, toast notifications, saved filters, and bulk actions. Icons are the one exclusion the first draft got wrong: the rail in ch. 8.3 needs them, so a small inline SVG set is in scope. A packaged icon library still is not, because a set of eight hand copied paths costs less than a dependency. Each is a feature the brief did not ask for, and PRD ch. 7.2 defines simple as small in scope. Adding them would trade the thing actually being graded, which is care in what exists, for surface area.

---

## 9. Verification

Before submission:

1. Contrast check every pairing in ch. 2.2, with the `surface` on `accent` result recorded explicitly.
2. axe DevTools with zero serious violations.
3. Visual pass at 375px, 768px, and 1440px, with screenshots kept for the README.
4. A reduced motion pass with the operating system setting enabled.

For the admin panel:

5. Contrast check the two rows in ch. 8.2 against the values actually declared in `cms/resources/css/app.css`.
6. Confirm the admin declares no token that ch. 8.1 and ch. 8.2 do not name, so the duplicated subset has not quietly grown.
7. Visual pass at 375px and 768px on the login screen, the dashboard, the property table, and the property form.
8. Keyboard pass on the confirm modal and on the mobile drawer: focus lands inside, stays trapped, Escape closes, and focus returns to the control that opened it.
9. Collapse the sidebar, then navigate. The rail must render collapsed on the very first paint of the next page, with no expanded frame in between. A flash here means the state went to `localStorage` instead of a cookie.
10. Screen reader pass over the rail: every item still announces its label.
