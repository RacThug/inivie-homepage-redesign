# Design System - iNi ViE Hospitality Homepage Redesign

| Field | Value |
| --- | --- |
| Document type | Design System Specification |
| Version | 1.3 |
| Date | 23 August 2026 |
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
| `on-ink-muted` | `#B0B7C2` | Secondary text on a dark ground. The mirror of `ink-muted`, added in #13 when the footer became the first dark surface needing two levels of text |
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
| `on-ink-muted` on `ink` | 7.70 | Passes. Fails on a light surface by design, exactly as `ink-muted` fails on a dark one |
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

Tailwind's default spacing steps, and only those. Arbitrary values are not permitted for spacing.

The steps are a 4px scale with half steps at 2, 6, 10 and 14 pixels, and the half steps are in play: the design pass measured the inside of the property card at 6, 10 and 14 (`docs/briefs/homepage-design-brief.md` ch. 4.3), which is finer than a card's outer rhythm because it is setting one block of type against another rather than one section against the next. The rule being enforced is that every value is a named step, not that every value is a multiple of four.

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

**Scroll entrance is specified and is not built.** `globals.css` defines the `enter` keyframes and the token that drives them, and nothing on the site consumes either: not the header, not the footer, not Featured Properties, and not the eleven sections of #15. Recording the gap rather than quietly widening the specification, because building it is a real decision rather than an oversight. It needs an `IntersectionObserver`, which makes every section that uses it a client boundary, and it needs the hidden starting state to sit behind `@media (scripting: enabled)` so that a visitor without JavaScript is not served a blank page. Neither is in the scope of #15, whose subject is typed content.

---

## 6. Component Specifications

### 6.1 Property card

Implements the information requirements in PRD ch. 6.2. This section covers only visual treatment.

| Element | Treatment |
| --- | --- |
| Image | 4:3 aspect ratio, `object-cover`, 12px radius, scales to 1.04 on card hover with the overflow clipped |
| Category badge | Overlaid at the top left of the image, `surface` background at high opacity, `ink` text, small label size |
| Rating | Top right of the content area. A `gold` star icon and a one decimal value in small size. The star is decorative and the value is named to assistive technology, because "4.8" beside an icon says nothing when it is read aloud |
| Title | H3 scale, `ink`, clamped to 2 lines |
| Location | Small size, `ink-muted`, preceded by a pin icon at 16px |
| Description | Body size, `ink-muted`, clamped to 3 lines |
| Price | Body size, prefixed with "From". The amount in `ink` medium weight, the "From" and "per night" qualifiers in `ink-muted`. Reads "From IDR 3,200,000 per night" |
| Button | Full width on mobile, auto width on desktop. `accent` background with text colour resolved per ch. 2.2 |
| Card | `surface` background, 1px `border`, 12px radius, rest elevation, raised on hover |

**Equal height rule.** Cards in a row must be the same height regardless of content length. Achieved by clamping the title and description and by pinning the button to the bottom of the card, not by fixing a card height.

**Inert state.** When `cta_url` is null the button renders visually muted and non-interactive. It is never a link to nowhere.

### 6.2 Section header

Eyebrow label, then heading, then optional intro paragraph. On desktop a secondary link may sit right aligned on the heading row. On mobile that link moves below the content, because a right aligned link next to a wrapped heading looks broken at narrow widths.

**"The content" means the section's, not the header's.** The link goes below the cards, not between the intro and the cards. A visitor on a phone reaches it having already been through everything the section had to offer, which is the moment they might want more of it; put it above the grid instead and somebody who has just scrolled past three cards has to scroll back up to leave. The desktop placement is the exception the narrow one makes room for, not the other way round.

That is why `SectionHeading` does not place the link and takes no `action`. The two positions have two different parents, and no prop on a heading component can put a child after markup that component does not own. The section owns the placement: one control in the document, moved by `order` inside a grid that spans header, link and content, rather than two copies toggled by `hidden` and `lg:hidden`. `FeaturedPropertiesFrame` is the worked example.

### 6.3 Button

| Variant | Treatment |
| --- | --- |
| Primary | `accent` background, text per ch. 2.2, 8px radius, `accent-hover` on hover |
| Secondary | Transparent background, 1px `ink` border, `ink` text |
| Ink | `ink` background, `surface` text, lightening to `ink-muted` on hover |
| Ghost | Text only in `ink`, underline on hover |
| Disabled | `muted` text on `border` background, no pointer events |

The ink variant is a section's own secondary control, one step below the accent fill so that a "View All Family" pill never competes with the call to action on the cards beneath it. PRD ch. 6.2 asks for it by name on Featured Properties. Its hover fill is `ink-muted` rather than an unnamed shade, because `ink-muted` is the one declared colour between ink and the page and `surface` on it is measured at AA in `palette.test.ts` rather than assumed.

The ghost variant carries no horizontal padding, because it is a text link: a button's inset would push it out of line with the paragraph it follows, and there is no fill there for the inset to be inside of.

The disabled and inert treatments **replace** the variant rather than layering over it. Combining them leaves two backgrounds and two text colours on one element, and which renders comes down to the order the utilities happen to be emitted in.

**Tone.** A control on a dark ground takes `tone="dark"`, which changes two things and only two: the focus ring inverts to `surface`, for the reason ch. 6.5 gives about the footer, and ghost resolves to `gold`, the one colour that carries text on ink. A filled variant is unchanged, because its own fill is already what it is read against.

**Size.** `size="field"` sets the 48px of a form control, so a submit button ends level with the inputs beside it rather than 4px short of them (ch. 6.8). It is named for the row it belongs to rather than for its height, because the height belongs to ch. 6.8 and not to this chapter.

Minimum hit area 44 by 44 pixels on mobile, per requirement RS2. Both axes, not height alone: horizontal padding leaves a short label under 44 pixels wide.

**Focus.** Every interactive variant carries a two pixel `ink` outline, offset by two pixels, on `focus-visible` only. Keyboard users get a visible ring without pointer users seeing one, and `ink` is used rather than `accent` because the ring must stay legible against the accent fill itself.

### 6.4 Header

Implemented in #13. Fixed to the top, so the hero runs underneath it rather
than being pushed down by it. Height 64px on mobile, 80px from the desktop
breakpoint.

**Two states.**

| State | Treatment |
| --- | --- |
| Resting, over the hero | No background. A scrim carries the labels: `ink` at 55 per cent fading to nothing over 220px, so the gradient ends below the header rather than at its edge. Labels and wordmark in `surface` |
| Scrolled | `surface` background, 1px `border` along the bottom, labels and wordmark in `ink`. The scrim is removed rather than faded, because it has nothing left to do |

The state is read from a sentinel one header tall at the top of the document,
watched by an `IntersectionObserver`. A scroll listener would run on every
frame to answer a question that changes twice.

**The wordmark**, 48px on mobile and 64px from the desktop breakpoint, in the
tone the state above sets. Both tones are in the markup at once and crossfade
with the header, rather than one `src` swapping on scroll: a swap flashes on
the first crossing while the second file loads, and it fights the colour
transition already running beside it. The ink tone is a recolour of the
production asset rather than a runtime `filter`, because a filter that
approximates ink resolves differently in every browser and ch. 2.1 is meant to
be the only place a colour is decided.

**Navigation.** Five entries, inline from 1024px, drawer below it. Four are
groups over a brand family and open a panel; one is a plain link. The
structure is production's, and so is every destination: this project redesigns
the homepage and nothing else, so each link is an absolute URL to the live
property that owns it and opens in a new tab.

A hovered or open entry is marked with a 2px `accent` rule under a label that
keeps its own colour, the same marker as ch. 6.4's earlier active state. Accent
reaches 2.39 to 1 on a light surface, so it marks and never carries text.
Production recolours the label to accent instead, which works on its own dark
header and would not survive the scrolled state here.

**The group panels.** A `surface` panel below the trigger, at least 224px wide,
`radius-control`, 1px `border`, `shadow-raised`, entering on the `animate-enter`
of ch. 5. Padding on the panel's wrapper bridges the gap under the trigger, so
the pointer does not cross a dead strip on the way down; a timeout there would
be guessing how fast someone moves a mouse.

Production opens these on `group-hover` and nothing else, which leaves four of
the five entries unreachable without a mouse. Hover is kept, because it is the
right behaviour for a pointer, but as an addition to a real disclosure rather
than the whole mechanism: the trigger is a button reporting `aria-expanded`,
Down arrow opens it and moves into the panel, Escape closes it and hands focus
back, and tabbing out of the last item dismisses it.

A click means different things by input. Touch and keyboard toggle, because
neither has a hover that could have opened the panel already. A mouse click
opens and does not close: dismissing what the pointer is still resting on is
what makes a hover menu feel broken, and production does nothing at all here.

**The focus ring inverts with the state.** ch. 6.3 sets an `ink` ring, which is
invisible over the hero, so the header's own controls take `currentColor` and
follow the label. Inside a group panel the ring is `ink` again, because the
panel is `surface` whatever the header behind it is doing.

**No booking control, in either navigation.** The hero's search panel of ch.
6.8 is the page's one way into the booking system, and it is the one PRD ch. 6
section 2a asks for. A "Book Now" in the header was a second entrance that
answered the same three questions with none of the visitor's answers:
`booking.inivie.com` bare lands on its own search form, so the control took
what the panel had already collected and discarded it. Two entrances to one
system, behaving differently, is what makes a booking flow feel untrustworthy.
Production has no such button either; its header carries the search widget.

**The drawer**, per RS3. A `surface` panel from the left, at most `24rem` wide,
over an `ink` scrim at 50 per cent. Focus moves to the close control on open,
is trapped inside while open, and returns to the toggle on close. Escape
closes. Every target is at least 44 by 44 pixels on both axes.

The entries match the desktop navigation exactly. Production's own drawer adds
Consultant and Offers that its desktop bar never shows, which teaches the
visitor two site structures; both already have a home in the footer of ch. 6.5.

Groups are laid out open rather than as accordions, with the group name as an
eyebrow caption in `ink-muted` and its links indented behind a 1px rule. There
are ten links in total and the panel scrolls, so collapsing them would hide the
structure behind a tap for no space that is actually short. The caption is
`ink-muted` and not `accent` because this one is text.

### 6.5 Footer

Implemented in #13. An `ink` ground, four columns at 1024px, two from 640px,
one below that.

| Column | Contents |
| --- | --- |
| 1 | Wordmark, head office address, general phone and email, map link |
| 2 | The five department desks, each with its own phone, email, and any secondary action |
| 3 | Company links, including the B2B consultancy lines the header no longer carries |
| 4 | Newsletter field and button, then social channels |

A legal row closes it, separated by a 1px rule at 15 per cent `surface`.

**Text.** Column headings are eyebrow scale in `gold`, which is the one surface
on the site where gold is allowed to carry text, at 6.87 to 1. Primary values
are `surface`. Secondary values are `on-ink-muted`. Actions are `gold`.

**The focus ring inverts here.** ch. 6.3 sets an `ink` ring, which is invisible
on an ink ground, so the footer uses a `surface` ring at the same width and
offset. This is the only place the ring changes colour, and it changes for the
same reason ch. 6.3 chose ink in the first place: the ring has to stay legible
against what is behind it.

**The five desks are not collapsible.** Production splits enquiries across
Reservations, Marketing, Media, Human Resources, Travel Agents and a general
line. Merging them into a single "contact us" would send a job applicant to the
reservations team, which is a redesign of the business rather than of the page.

### 6.6 Skeleton

The loading skeleton for the property grid renders three placeholder cards whose dimensions match the real card exactly, including image ratio and clamped line counts. A skeleton with different dimensions causes the layout shift it was meant to prevent.

Everything not decided by the content is matched by construction rather than by measurement. The skeleton lays out in the same `CardGrid` the real cards land in, with the same padding and the same button box, and each placeholder line carries the type scale of the line it stands in for and holds a non-breaking space, so its line box is the height of the text it replaces on both breakpoints and stays that way if the scale moves. A bar of some chosen height is only ever right by coincidence, and placeholder lines within one block sit flush, because the clamped paragraph they stand in for has nothing between its lines but leading.

**What "exactly" cannot cover.** The two title lines and three excerpt lines are the clamps above, and a clamp is a ceiling rather than a shape. Measured against the seed data at 1440, the skeleton card stands 28 pixels taller than the real one, because every seeded title fits on one of its two permitted lines. Reserving one line instead would move the same 28 pixels onto the first property an editor names at length, so the clamp is what is reserved. This is bounded rather than solved, and it is worth knowing that on the homepage as it ships the skeleton is never painted at all: the page is prerendered, so the read resolves before the document exists.

The skeleton does not animate. Ch. 5 lists what motion is for on this site, and a pulsing placeholder is not on it. It is also hidden from assistive technology: there is nothing there to read.

### 6.7 Section rhythm and grounds

Implemented in #15 as `ui/Section`. It owns the 64px and 96px vertical padding of ch. 4.1 and carries the `Container`, so the number that sets the page's rhythm exists once rather than in eleven files that agree today.

**The grounds alternate**, `surface-alt` and `surface` turn and turn about down the page, with one `ink` band interrupting them at the membership section. Every section takes its ground as a prop and none of them chooses one: `app/page.tsx` holds the order and the ground together, and `page.test.ts` checks that no two neighbours share one. PRD ch. 6.3 asks for that rhythm before it asks for anything else about spacing.

The rule under test is "no two neighbours the same" rather than "odd and even", because `ink` is not a third step in an alternation. It is the one section that steps out of it, and a rule expressed as a position could not say that.

One case the rule cannot cover: Featured Properties disappears outright when nothing is published (F4), and the sections below it then alternate from a different starting point. That is a state a live site passes through once, and correcting it would mean measuring the page in the browser.

A section that is not `Container` wide is a hero, and a hero is not a `Section`.

`ui/SectionLayout` sits inside it and owns the header, the one secondary control, and the content, with the control placement of ch. 6.2. `FeaturedPropertiesFrame` was that markup until five sections needed it.

### 6.8 Hero and search panel

**Full viewport height at every breakpoint**, which is production's, over a 480px floor so a short landscape window still gets a hero rather than a strip. `vh` rather than `dvh`: `dvh` follows a mobile browser's chrome as it hides and shows, which would resize the hero under the visitor mid scroll and take the layout shift score with it.

Production's own height took some finding. `inivie.com` stamps `data-is-bot="true"` on the document for automated visitors and carries `html[data-is-bot="true"] .hero { height: 400px !important }`, so a headless browser measures a 400px hero and a person sees `100vh`. Every measurement of that page in this document was re-taken with the flag defeated.

**Production's film, over production's poster.** Two cuts, because production ships two and they are different edits rather than two crops of one: a 1920x1080 landscape film, and a portrait one stored 1080 by 1080 with a 9:16 sample aspect. The switch is production's own, at 768px. Both are production's files with the audio track stripped and the moov atom moved to the front; no video frame is re-encoded, so what plays here is what plays on inivie.com, pixel for pixel.

| | landscape | portrait |
| --- | --- | --- |
| Serves | 768px and up | below 768px |
| Runtime | 31.7s | 36.5s |
| Weight | 15.8MB | 11.6MB |

**The poster is what paints.** It is a `next/image` with `priority`, and the film mounts only after hydration and fades in over it across one second. The largest contentful paint is therefore the same 143KB still it was before the film existed, which is what keeps ch. 8.2's floor reachable. If the film never arrives, the hero is exactly what it was.

Only one cut is ever fetched, and the choice is made once. A `media` attribute on two `<source>` elements leaves both files reachable and browsers have long disagreed about which they pull, so the decision is made in script instead. It is not revisited: a phone at 390 by 844 turned on its side is 844 wide and crosses the switch, and a live query would answer a rotation with a fifteen megabyte download.

**Under `prefers-reduced-motion: reduce` the film is never requested.** Not fetched and paused, never asked for. This is the one place the hero departs from production, which plays its loop whatever the operating system has been told, and it departs because ch. 5 calls the setting a hard requirement rather than a preference.

**What the film shows, and why the overlay covers everything.** Both cuts are advertisements rather than background footage, with copy burned into the frame for most of their runtime: a Forbes award card, a "WE sustain our nature" sequence, a screen recording of a signup form, a fifty thousand welcome coins promotion on the landscape cut and a membership benefits list on the portrait one, and four seconds of white end card at the close of each. Playing them behind a hero was a decision taken with those frames on the table.

The overlay is what makes it survivable, and it is production's: `ink` solid at the top, through 40 per cent at the middle, to 40 per cent at the foot. The lower half scrim this hero used to carry is gone. A still can be chosen to sit under a panel; 31 seconds of film cannot, and a white end card under a 95 per cent `ink` panel with `surface` text would take the panel's text with it. Solid `ink` at the top is what holds the header's labels through the same four seconds.

The cost is the one production pays too: the picture is never seen undimmed. That is the trade the overlay buys, and it is the reason production's hero reads slightly murky in every state.

**The panel sits inside the hero**, pinned to its foot with 24px of clearance on mobile and 48px on desktop, and the section is one 100vh unit holding both. It used to hang off the hero's bottom edge on a negative margin, which put the Search control 30px below the fold at every desktop and tablet size once the hero grew to the full viewport. Baymard's travel accommodations testing is blunt about that failure: a visitor must not have to scroll while entering search criteria, and where the search sat below the fold, testers took up to 30 seconds to find it at all. Positioning inside the section makes it true by construction rather than by a margin that has to be re-tuned whenever the panel's height changes.

Production docks its widget into the header at the top of the hero instead. The foot is kept here because a panel at the top competes with the navigation for the same 90 pixels, which is visible on production whenever its film reaches a bright frame.

**Three fields, and none of them the browser's own.**

| Field | Control | Sends |
| --- | --- | --- |
| Destination | Listbox of production's nine, in a `surface` panel | `city` |
| Dates | One trigger, one range, a two month calendar | `checkin`, `checkout` |
| Guests | Stepper, 1 to 8 | `adults` |

Every one writes to a hidden input, so the panel stays a real GET form: the fields are this project's and the query string is production's.

**Why none of them are native.** A `select` and two `date` inputs took almost no styling and took it differently per engine: in WebKit the destination rendered as a white pill with dark text on an ink panel, ignoring every token it was given, and the dates rendered as `2026-08-23` with no calendar control at all. Only a few WebKit and Chromium pseudo-elements accept CSS and Firefox exposes almost nothing.

Appearance is the smaller half of it. A native `date` input cannot draw two months, cannot tint the nights between two days, and cannot show a check-out grid refusing the days before check-in. Two separate fields also made the visitor hold the first date in their head while choosing the second, when a stay is one decision. Consolidating them is where the column for the guest count came from.

**The month is spelled.** `23 Aug 2026`, not `23/08/2026`. NN/G's date input guidance asks for this precisely because `10/11/2016` is two different days either side of the Atlantic, and the numeric form is what a native input gave us.

**The calendar.** Two months from 640px and one below it, weeks starting Monday, everything before today disabled, and a range of at least two days so a stay always has a night in it. Range ends are `ink` filled with `surface` text and the nights between them are `surface-alt`; accent marks today as a ring and never fills a day, because accent reaches 2.39 to 1 on a light ground and a selected day has to stay readable.

`react-day-picker` supplies the calendar, and it is the project's first runtime dependency in `web/`. Its own stylesheet is deliberately not imported: every class is supplied from this document's tokens, so there is no second source of colour to keep in step with `globals.css`.

**What the calendar cannot say.** Availability. Baymard's research is direct that a date picker which does not communicate it sends people elsewhere to check and sometimes they do not come back. Booking is a separate application that PRD ch. 3.2 puts out of scope, so this calendar shows dates and stops. It is a known gap, not an oversight.

**The panels open upward**, and on a phone they are a sheet pinned to the bottom of the window. The search panel lives at the foot of the hero, so a menu opening below its trigger opens off the bottom of the window: the two month calendar measured 418px tall against 60px of room.

**The guest count is asked for rather than assumed.** It was a hidden `adults=2` until this field existed. A couple is not the same search as a family of five, and sending everyone to a two adult result set means the first thing a family does on the booking system is redo the search they already did here. `adults` is the only guest parameter production's query string carries, so it is the only one offered: a children field would be a control whose value is dropped at the seam.

**One height for every field**, 48px, set here rather than inherited. This used to be a note about a `date` input standing taller than a `select` at the same padding; now that every control is this project's, the shared height is simply declared and three fields in a row cannot disagree by three pixels.

**Where it collapses.** One tappable summary row below 640px, two columns from 640px, one row from 1024px. The brief put the collapse below the tablet breakpoint; 728px of usable width fits four controls comfortably, so a tablet gets the fields rather than a control it has to open first. The summary row is not rendered above 640px at all: a hidden toggle still reporting a collapsed state describes a panel that is permanently open.

**The dates are uncontrolled.** The homepage is prerendered, so a default computed while rendering would be the date the build ran and would still be that date a month later. They are written once on mount, and the check-out floor moves with the check-in.

### 6.9 Welcome block

A centred column below the hero on `surface-alt`, carrying the page's one H1, the company paragraph capped at the measure, and a single primary control.

Centred, which ch. 7.3 otherwise treats as a smell. It is correct here for the same reason it is correct on the FAQ: there is no second column to pair with, and a left aligned block would leave the right half of a 1280px container empty.

### 6.10 Venue card

Restaurants and spas. Deliberately lighter than the property card, and **the weight comes off the chrome rather than the information**: no border, no elevation, no button.

| Element | Treatment |
| --- | --- |
| Image | 4:3, `object-cover`, 12px radius |
| Category badge | Top left over the image, the same `Badge` the property card uses |
| Name | H3 scale, `ink` |
| Location | Small size, `ink-muted`, preceded by the 16px pin of ch. 6.1 |

**Nothing here is pressable and nothing moves on hover.** These venues are not bookable objects on this page, so the section's own control is the one way out of it, which is the one primary action per section of PRD ch. 6.3. The property card scales its image because the whole card is a link and the motion says so; repeating that on something inert would be decoration, and ch. 5 lists what motion is for.

The Culinary and Wellness sections are one component with two content modules. That is what guarantees the pair reading the brief asks for: a change to one cannot miss the other.

### 6.11 Membership band

A full bleed `ink` band. Production makes this section a full bleed **orange** block, which is exactly the large decorative accent fill ch. 2.3 forbids, and white on accent measures 2.39 to 1. The section that needs the most emphasis on the page takes it from ink instead. Do not "correct" this back towards production.

**Full bleed rather than a contained panel**, which is the one thing production's treatment gets right. A rounded card leaves the page's own ground running down both sides of the section that is supposed to interrupt it, and the result reads as a large card rather than as a change of register.

**Two columns from the desktop breakpoint.** Copy, tagline and controls left; the four benefits as a two by two grid right, vertically centred against the copy. Pinned to the top the benefits leave the empty corner the single column layout would have left; spread to the full height they leave a hole through the middle and read as two pairs.

| Element | Treatment |
| --- | --- |
| Eyebrow | `gold` |
| Heading | `surface`, title case. Production sets it in all caps, which ch. 7.3 rules out |
| Tagline | Body scale, medium weight, `surface` |
| Body | Body scale, `on-ink-muted` |
| Benefit marker | A short `gold` rule above each label, per ch. 6.16. Four drawn icons would be four decisions about what a "celebration setup" looks like |
| Primary | `accent` fill with `ink` text. The only accent on the panel |
| Secondary | `ghost` on a dark tone, which resolves to `gold` (ch. 6.3) |

The two controls sit at their own width rather than stretching, on every breakpoint. A column that stretches them centres the text link under a full width button, where it reads as a caption rather than as a control.

### 6.12 Offer banner

Five banners: one column mobile, two tablet, three desktop with the first spanning two. Five fills that grid exactly, a wide one plus one on the first row and three on the second; four leaves a hole in the bottom right corner.

Square until the desktop breakpoint, where a 352px floor replaces the ratio so the spanning tile and its neighbour end the row level. An aspect ratio cannot do that job for two tiles of different widths in one row.

**No title is rendered.** Production sets the offer name into the artwork, and these are production's own banners, so printing it again underneath would be the title twice ch. 7.3 rules out. The name is the link's accessible name instead, which fixes production's real defect here: all five of its banners carry an alt of "promo".

The photograph inside that link carries an empty `alt`. It is mood rather than information once the link says which offer it leads to, and a second string there would either be swallowed by the link's own name or make every tile announce itself twice.

A soft **even** `ink` scrim at 20 per cent buys back the contrast that white type over an arbitrary photograph has no guarantee of. It does not move on hover; the image scales to 1.04 under it.

The brief ch. 4.8 asks for the header's top down gradient here. That gradient exists to protect type sitting at the top of a frame, which is where the header's labels are. These titles are set into the middle of the artwork, where a top down gradient has already faded to nothing, so an even scrim is the same idea applied to where the type actually is.

One departure is worth naming. Four of the five banners set that baked in title in all caps, which ch. 7.3 rules out for type this project sets. It is not type this project sets, and re-lettering a client's artwork is further than a homepage redesign reaches.

### 6.13 Journal card

Three articles, in the shared card grid. Image 4:3 with a 1.04 hover scale, then the section label in the eyebrow scale, then the title at H3 **clamped to three lines**: these are long editorial titles and cards in a row have to end level.

**The whole card is the link.** Production ships a title link and a "Read More" button that lead to the same place, which makes a keyboard user tab twice for one destination.

### 6.14 Media row

Two columns mobile, four from the tablet breakpoint, which lands eight marks as two clean rows at every width. Each mark sits in a fixed 40px or 48px box with `object-contain`, greyscaled, at 70 per cent opacity: a wordmark six times as wide as a monogram cannot share a width, and a fixed box plus `object-contain` is what keeps them optically level. The greyscale is set in CSS rather than left to the files, which all happen to be monochrome already, so a coloured mark added later cannot quietly break the row.

**Every mark is named.** Production serves nine logo files with no alternative text at all, so a screen reader is handed nine images and told nothing. Eight are named here and the ninth is not shown, because its owner could not be established and an unnamed logo in a "featured in" row is a claim nobody can check. The marks are not links, on production either.

**The header is one label, at the eyebrow scale, and that label is the section's heading.** Production and the design pass both set this line and write nothing under it. A sentence invented to fill that gap would be placeholder copy wearing a design system's clothes, and a landmark still has to be named by something a reader can see. This is the one section whose header does not use `SectionHeading`.

### 6.15 FAQ accordion

`details` and `summary`. The browser supplies the role, the expanded state, Enter and Space, and it all works before hydration and with script switched off, which is what issue #15 means by keyboard operable without custom JavaScript. A `div` with an `onClick` and a hand written `aria-expanded` is the same component with more ways to be wrong, and an `aria-expanded` written here would be a second source of truth for a fact `details` already publishes.

**The rows are independent, not exclusive.** Closing somebody's answer because they opened a second one is a behaviour nobody asked for, and it is the only thing here that would need script.

| Element | Treatment |
| --- | --- |
| Column | Centred, capped at 896px. The one section on the page with no second column to pair with |
| Row | A 1px `border` rule between rows, 56px minimum height |
| Question | Body scale, medium weight, `ink`, left aligned inside the centred column |
| Marker | A plus whose vertical stroke fades out when the row opens, `ink-muted`, right aligned on the row |
| Hover | The row ground shifts to `surface-alt` |
| Answer | Body scale, `ink-muted`, capped at the measure |


### 6.16 The gold rule

A 32 by 2 pixel `gold` rule, set above a heading with 12px beneath it. It marks the start of the membership benefits and of each Our Story chapter, and nothing else.

ch. 2.1 gives gold exactly this job: rules, dividers and markers, never text on a light surface. It is what this palette has in place of an accent that could be used decoratively, and it is the one mark on the page that carries the brand's warmth without a photograph doing it.

Decorative, so it is hidden from assistive technology. The block it opens already announces itself with a heading, and a rule that announced itself as well would be read out four times in a row for no gain.

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
| Hero height | 100vh | 100vh | 100vh |

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

That layout is bought with CSS, and CSS charges for it: changing the `display` of a table element drops its implicit semantics in every major browser, so the roles are written out explicitly on the table, the row groups, the rows, and the cells. They restate what the elements already are, and unlike the implicit ones they survive the display change. Without them the stacked list reaches a screen reader as undifferentiated text at exactly the width where the visual grouping is carrying the most meaning.

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
