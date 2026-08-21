# PRD - iNi ViE Hospitality Homepage Redesign

| Field | Value |
| --- | --- |
| Document type | Product Requirements Document |
| Project | Technical Test - Homepage Redesign for inivie.com |
| Version | 2.0 |
| Date | 21 August 2026 |
| Submission deadline | 27 August 2026 (GitHub link sent to the HR team) |
| Tech stack | Option 2: Next.js + Tailwind CSS + Laravel (CMS & API) + MySQL |
| Dynamic section chosen | **Featured Properties** ("Featured property for you") |

**Scope of this document.** This PRD states *what* is being built and *why*. It is meant to stay stable once agreed. Everything describing *how* lives in the companion documents below, so that a schema tweak or an endpoint change never forces an edit here.

| Document | Owns |
| --- | --- |
| **PRD.md** (this file) | Problem, goals, scope, the dynamic section decision, functional requirements, acceptance criteria, plan, risks |
| [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md) | Architecture, stack decisions, CMS implementation, repository structure, security, testing strategy |
| [DATA-MODEL.md](./DATA-MODEL.md) | Database schema, indexes, domain rules, seed data |
| [API-SPEC.md](./API-SPEC.md) | Endpoint contract, payloads, caching, revalidation, failure behaviour |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | Colour, typography, spacing, motion, breakpoints, component visual specs |

---

## 1. Executive Summary

Rebuild the `inivie.com` homepage as a decoupled application: **Next.js** as the presentation layer and **Laravel** as both the CMS and the REST API provider on top of **MySQL**. The interface is redesigned to be modern, clean, and responsive across desktop, tablet, and mobile.

One section, **Featured Properties**, is made fully dynamic. Its content is managed end to end through the CMS (create, read, update, delete) and rendered on the homepage by calling the Laravel API. The remaining sections ship as structured static content so the test stays focused and deep rather than broad and shallow.

---

## 2. Brief Analysis

### 2.1 Explicit requirements from the test document

| # | Requirement | Interpretation | Covered in |
| --- | --- | --- | --- |
| R1 | Redesign the inivie.com homepage | A visual redesign, not a pixel-for-pixel clone. Information architecture may be reorganised as long as the value proposition still reads clearly | Ch. 6, DESIGN-SYSTEM |
| R2 | Responsive on desktop, tablet, and mobile | Three breakpoints must be explicitly tested, not merely "not broken" | Ch. 8.1, DESIGN-SYSTEM |
| R3 | Clean code and a tidy project structure | Clear layering, consistent naming, no dead code, automated lint and formatting | TECHNICAL-DESIGN |
| R4 | A simple CMS built with Laravel | "Simple" means small in scope but correct, not half finished. Auth, validation, and authorisation remain mandatory | Ch. 7 |
| R5 | Pick 1 section other than Hero to be dynamic | Exactly one section, delivered end to end | Ch. 5 |
| R6 | Content can be added, edited, and deleted through the CMS | Full CRUD plus image upload, ordering, and publish state | Ch. 7.1 |
| R7 | Display that CMS data on the homepage | Rendered from real database records, never hardcoded | Ch. 6.2 |
| R8 | With Next.js, CMS data is fetched through the Laravel API | Next.js must not query MySQL directly. Everything goes over an HTTP JSON API | API-SPEC |

### 2.2 Current state of the live site (investigated)

Verified directly against `https://inivie.com` and `https://blog.inivie.com` on 21 August 2026.

**Topology**

| Component | Host | Technology |
| --- | --- | --- |
| Frontend | `inivie.com` | Next.js (detected via `/_next/static/chunks/*` bundles) + Tailwind CSS |
| Content CMS and API | `blog.inivie.com` | Headless WordPress + LiteSpeed Cache, REST at `/wp-json` |
| Media | `blog.inivie.com/wp-content/uploads` and `ik.imagekit.io` | Origin plus an image transformation CDN |
| Booking | `booking.inivie.com` | Separate system, out of scope |

Production fonts: **Poppins**, **Inter**, **Lato**, and **Great Vibes** (script, used as an accent). Dominant production colours: navy `#1C2434`, orange `#FF8737` and `#FF8432`, gold `#C9A779`, neutrals `#F0F0F0` and `#AAB1BB`. These feed the token set in [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md).

**Production API authentication model (probed against public endpoints)**

| Probe | Result | Conclusion |
| --- | --- | --- |
| `GET /wp-json/wp/v2/posts` with no credentials | `200`, full JSON | Read endpoints are public and anonymous |
| `targetHints` field in the payload | `{"allow":["GET"]}` | The server explicitly states anonymous callers may only read |
| `GET /wp-json/wp/v2/users` with no credentials | `401 rest_user_cannot_view` | Sensitive endpoints stay closed |
| `GET /wp-admin/` | Login form, `Set-Cookie: ...; secure; HttpOnly` | The admin panel uses cookie based sessions, not bearer tokens |
| CORS headers on read endpoints | `Access-Control-Allow-Origin: https://inivie.com`, `Access-Control-Allow-Credentials: true` | The frontend origin is allowlisted rather than using a wildcard |
| Additional header | `X-Robots-Tag: noindex` | API responses are kept out of search indexes |

**Implication 1.** Choosing Option 2 is not merely a preference, it mirrors the production architecture. The value this test adds is showing that the WordPress layer can be replaced by a Laravel API behind a clean contract, without changing the frontend paradigm.

**Implication 2.** The auth model adopted in this project, a public read-only API paired with session auth for the admin panel, is not an assumption. It is the pattern production actually runs. The same applies to the CORS policy. Both are replicated rather than invented. See TECHNICAL-DESIGN ch. 2.3 and ch. 6.

**Implication 3.** Data is fetched server side. The raw `wp-json` response was found embedded inside the homepage RSC payload rather than requested from the browser. This reinforces the Server Component and ISR choice recorded in TECHNICAL-DESIGN ch. 3.

### 2.3 Production weaknesses deliberately not replicated

Two issues were found in production and are corrected in this redesign. Both are worth a brief mention in the README as evidence of critical reading, not as criticism.

| Production finding | Impact | Treatment in this project |
| --- | --- | --- |
| The homepage pulls the entire article body, `_links`, revision history, and Yoast schema even though the card only needs a title, image, and date. A single post weighs roughly 37 KB | Inflated page payload and slower render | The API returns only the fields the card actually uses. No HAL envelope, no unused relations. See API-SPEC ch. 1 |
| The frontend requests `_embed` for author data, but the `users` endpoint rejects anonymous callers, so `_embedded.author` in the homepage payload contains a `rest_user_cannot_view` error object | The API contract fails halfway, silently and undetected | The payload shape is defined once and mirrored as a TypeScript type. Feature tests assert every promised field is genuinely populated. See API-SPEC ch. 6 |

### 2.4 Existing homepage section inventory

| # | Section | Content | Dynamic candidate |
| --- | --- | --- | --- |
| 1 | Hero | Background image, heading, paragraph | Excluded by the brief |
| 2 | Featured property for you | 3 property cards (Leedon Villa Seminyak, Ajowa Resort, La Mewali Resort) | **Yes** |
| 3 | The Culinary Journey | 3 restaurant cards | Yes |
| 4 | Wellness Harmony Escape | 3 spa cards | Yes |
| 5 | JOIN WEINIVIE MEMBERSHIP | Promo copy, CTA, 4 benefit icons | Weak |
| 6 | Our Story | 3 images, 4 narrative subsections | Weak |
| 7 | Our Special Offers | 5 promotional banners | Yes |
| 8 | What's New | 6 blog cards | Yes |
| 9 | Featured In | 9 media logos | Weak |
| 10 | Frequently asked questions | 8 question and answer pairs | Moderate |
| 11 | Search & Book | Destination selector and date picker | Not content |

---

## 3. Goals and Non-Goals

### 3.1 Goals

| ID | Goal | Success measure |
| --- | --- | --- |
| G1 | The homepage looks modern and clean | Consistent visual hierarchy, scale based spacing, nothing that reads as a default template |
| G2 | Responsive with no defects | Zero horizontal scroll and zero layout breaks at 375px, 768px, and 1440px |
| G3 | Featured Properties is fully dynamic | An admin can add, edit, delete, reorder, and publish or unpublish without a redeploy |
| G4 | A correctly decoupled architecture | Next.js talks to Laravel over HTTP JSON only, with zero direct database access |
| G5 | Code worth reviewing | Clean lint and typecheck, green core tests, a folder structure explainable in one paragraph |
| G6 | A reviewer can run the project in 10 minutes | A README whose setup steps genuinely work from a fresh clone |

### 3.2 Non-Goals

- Cloning the existing homepage pixel for pixel.
- Building pages beyond the homepage (property detail, blog detail, brand pages).
- Booking, room availability, payments, or PMS integration.
- Multi-language, multi-currency, and multi-tenancy.
- Tiered roles and permissions. A single admin role is sufficient.
- Migrating content from the existing WordPress instance.
- Production deployment. Running locally with clear instructions is enough.

---

## 4. Scope

### 4.1 In scope

1. A Next.js application containing one homepage with all its sections.
2. A Laravel application containing the admin CMS (login and Featured Properties CRUD) plus the public REST API.
3. The MySQL schema with migrations, seeders, and factories.
4. Property image upload and storage.
5. Documentation: a root README plus the five documents listed at the top of this file.
6. Automated tests covering the critical paths on both sides.

### 4.2 Out of scope

Everything in chapter 3.2, plus CDN, monitoring, analytics, and a CI/CD pipeline. If time allows, a GitHub Actions workflow for lint and tests is a nice to have, not a requirement.

---

## 5. Dynamic Section Decision

### 5.1 Section chosen

**Featured Properties**, the second section of the homepage, headed "Featured property for you".

### 5.2 Candidate scoring matrix

Scored 1 to 5, higher is better.

| Candidate | Business value | Data model richness | Real change frequency | CRUD demonstration | Scope cost | Total |
| --- | --- | --- | --- | --- | --- | --- |
| **Featured Properties** | 5 | 5 | 5 | 5 | 4 | **24** |
| Special Offers | 4 | 3 | 5 | 4 | 4 | 20 |
| What's New (blog) | 3 | 4 | 4 | 4 | 2 | 17 |
| The Culinary Journey | 3 | 4 | 2 | 4 | 4 | 17 |
| FAQ | 2 | 2 | 2 | 4 | 5 | 15 |
| Featured In | 1 | 1 | 1 | 3 | 5 | 11 |

### 5.3 Why this section

1. **Highest business value.** Featured Properties is the first section after the Hero and the showcase for the group's core business. Making it dynamic lets the marketing team rotate featured properties on their own, which is the most realistic CMS use case in hospitality.
2. **A rich enough data model without being complicated.** It carries a title, category, location, short description, image, starting price, rating, and destination URL. That forces a demonstration of varied validation types, file upload, number and currency formatting, and null handling. Compare that with Featured In, which is only a logo and a URL, far too thin to demonstrate code quality.
3. **Content genuinely changes often.** Featured properties rotate with the season, occupancy, and campaigns. Ordering and a publish toggle are real needs, not invented features.
4. **It demonstrates the most complete CRUD.** Create needs an image upload. Update needs old image replacement or retention. Delete needs file cleanup and confirmation. Reorder needs a batch operation. Every path is interesting to review.
5. **Scope cost stays contained.** It requires neither a rich text editor nor a detail page, unlike the "What's New" blog section, which would drag in a WYSIWYG editor and extra routing that are clearly outside the test scope.

### 5.4 Runner up

**Special Offers** is the fallback if an additional section is ever requested. Its data model is interesting because it has a validity period, which introduces active window logic in the query. Visually, however, it is only banners, so it is poorer at demonstrating UI composition.

---

## 6. Homepage Requirements

### 6.1 Section structure

| # | Section | Data source | Requirement |
| --- | --- | --- | --- |
| 1 | Header and navigation | Static | Sticky. Transparent over the hero, solid on scroll. A drawer below 1024px |
| 2 | Hero | Static | One large image, heading, subheading, and a single primary CTA. No carousel, so the largest paint stays cheap |
| 3 | **Featured Properties** | **Dynamic, via the Laravel API** | The centrepiece of the test. Detailed in ch. 6.2 |
| 4 | The Culinary Journey | Static | Three restaurant cards |
| 5 | Wellness Harmony Escape | Static | Three spa cards |
| 6 | WeInivie Membership | Static | A dark contrasting panel with four benefits and a CTA |
| 7 | Our Story | Static | Narrative with four subsections |
| 8 | Our Special Offers | Static | Promotional banner grid |
| 9 | What's New | Static | Three latest article cards, trimmed from six so the page does not run too long |
| 10 | Featured In | Static | A row of media logos in greyscale |
| 11 | FAQ | Static | Accordion, keyboard operable |
| 12 | Footer | Static | Contacts, department links, social media, legal |

All static content must be stored as typed structured data, never inline in markup, so that promoting another section to dynamic later means swapping the data source rather than rewriting the component. Implementation detail in TECHNICAL-DESIGN ch. 4.2.

### 6.2 Featured Properties requirements

**Composition**

- A small eyebrow label, for example "Stay With Us".
- A section heading, "Featured property for you".
- A one to two sentence intro paragraph.
- The property card grid.
- A secondary "View all properties" link.

**Information each card must communicate**

| Element | Requirement |
| --- | --- |
| Image | Always present. Must carry meaningful alternative text |
| Category | Visible at a glance, so a visitor can tell a resort from a villa without reading |
| Rating | Shown when available. Omitted entirely when absent, never shown as zero |
| Title | The property name, never truncated mid word |
| Location | Always present |
| Description | A short teaser, consistently clamped so cards stay the same height |
| Starting price | Shown when available, formatted with a currency and a per night qualifier. The entire row is omitted when absent |
| Call to action | Leads to the property destination. Rendered inert, not broken, when no destination is set |

Visual treatment of these elements is specified in [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) ch. 6. Field mapping is specified in [API-SPEC.md](./API-SPEC.md) ch. 3.

**Behaviour requirements**

| ID | Requirement |
| --- | --- |
| F1 | Only published properties appear. Drafts must never leak to the public homepage |
| F2 | Card order is controlled from the CMS, not by insertion order |
| F3 | The section shows 3 cards by default and must tolerate up to 6 without layout damage |
| F4 | When no published properties exist, the whole section is hidden including its heading, leaving no empty gap |
| F5 | When the API is unavailable, the section degrades to a quiet fallback and the rest of the homepage still renders. A single failing section must never take down the page |

### 6.3 Visual redesign principles

1. **Photography leads.** Hospitality sells on imagery. Copy supports the image, not the other way around.
2. **Consistent spacing rhythm.** Uniform gaps between sections so the page reads as one system rather than a stack of blocks.
3. **One primary action per section.** Avoids competing calls to action that leave the visitor unsure what to do.
4. **Controlled measure.** Paragraphs capped at roughly 65 characters for comfortable reading.
5. **Accent colour used sparingly.** Orange is reserved for actions and markers, never as background decoration.

---

## 7. CMS Requirements

These are capability requirements. Routes, validation rules, and storage mechanics are in [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md) ch. 5.

### 7.1 What an admin must be able to do

| ID | Capability | Acceptance signal |
| --- | --- | --- |
| C1 | Sign in, and be blocked from every admin screen when signed out | Visiting an admin URL without a session lands on the login page |
| C2 | Create a property, including uploading its image | The new property appears on the homepage |
| C3 | Edit any field of an existing property | The change appears on the homepage |
| C4 | Replace a property image, or keep the existing one untouched | No orphaned files accumulate |
| C5 | Delete a property behind an explicit confirmation | The card disappears from the homepage |
| C6 | Publish or unpublish without opening the edit form | An unpublished property vanishes from the homepage but is preserved in the CMS |
| C7 | Reorder properties | The homepage card order follows |
| C8 | See clear feedback for every action, including validation failures | Errors are shown per field with the submitted values preserved |

### 7.2 Quality bar for the admin panel

The brief calls the CMS "simple". Simple means small in scope, not unfinished. The panel must still ship with a consistent layout, a confirmation for every destructive action, a flash message for every completed action, informative empty states, unambiguous published and draft indicators, and forms that remain usable at 768px. A messy panel reads as carelessness, not as simplicity.

---

## 8. Non-Functional Requirements

Targets are stated here. How each target is met is in [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md) ch. 7.

### 8.1 Responsive

| Name | Range | Reference devices |
| --- | --- | --- |
| Mobile | 320px to 639px | iPhone SE 375px, iPhone 14 390px |
| Tablet | 640px to 1023px | iPad Mini 768px, iPad Air 820px |
| Desktop | 1024px and up | Laptop 1440px, wide monitor 1920px |

| ID | Requirement |
| --- | --- |
| RS1 | No horizontal scroll at any width from 320px upward |
| RS2 | Touch targets at least 44 by 44 pixels on mobile |
| RS3 | Navigation collapses to a drawer below 1024px, operable by keyboard |
| RS4 | Mobile never downloads desktop sized image assets |
| RS5 | No clipped or overflowing text on the longest title in the seed data |
| RS6 | Manually verified at 375px, 768px, and 1440px before submission, with screenshots in the README |

### 8.2 Performance

| Metric | Target |
| --- | --- |
| Lighthouse Performance, mobile, local production build | at least 90 |
| Largest Contentful Paint | under 2.5 seconds |
| Cumulative Layout Shift | under 0.1 |
| Total Blocking Time | under 200 milliseconds |
| JavaScript on the homepage route | under 150 KB gzipped |

### 8.3 SEO

Descriptive title and description, social sharing metadata, `robots.txt` and `sitemap.xml`, a single top level heading per page with a correct heading hierarchy, organisation structured data, and a canonical URL.

### 8.4 Accessibility

Target WCAG 2.1 level AA. Semantic landmarks, meaningful alternative text on every image, visible keyboard focus, full keyboard operability, contrast meeting the AA threshold, and no serious violations reported by axe DevTools.

### 8.5 Security

| ID | Requirement |
| --- | --- |
| S1 | The admin panel is unreachable without authentication |
| S2 | The public API exposes read operations only. No mutation endpoint is publicly reachable |
| S3 | Uploads are constrained by type and size, and cannot be used to place executable files in a served path |
| S4 | No database credentials or secrets exist in the frontend application or in version control |
| S5 | Cross origin access to the API is limited to the frontend origin, never a wildcard |

---

## 9. Acceptance Criteria

Every line must be verifiable by a reviewer without further explanation.

| ID | Criterion | Maps to |
| --- | --- | --- |
| A1 | The homepage renders at `localhost:3000` with all 12 sections populated | R1 |
| A2 | No horizontal scroll and no layout breaks at 375px, 768px, and 1440px | R2, RS1 |
| A3 | Lint, typecheck, and formatter checks are clean on both applications | R3 |
| A4 | The repository structure matches TECHNICAL-DESIGN ch. 8, with no unused files | R3 |
| A5 | The CMS is reachable at `localhost:8000/admin` and requires login | R4, C1 |
| A6 | The dynamic section is Featured Properties, not the Hero | R5 |
| A7 | Creating a property in the CMS makes it appear on the homepage | R6, R7, C2 |
| A8 | Editing a property updates the homepage | R6, R7, C3 |
| A9 | Deleting a property removes it from the homepage | R6, R7, C5 |
| A10 | Draft properties never appear on the homepage | R6, F1 |
| A11 | CMS ordering determines the card order on the homepage | R6, F2 |
| A12 | The homepage fetches through the documented API endpoint, provable via the Network tab or the Laravel log | R8 |
| A13 | No database credentials exist anywhere in the Next.js application | R8, S4 |
| A14 | The homepage still renders cleanly when Laravel is stopped | F5 |
| A15 | The README enables setup from scratch in 10 minutes | G6 |
| A16 | The full automated test suite is green | G5 |

---

## 10. Delivery Plan

Six working days are available, 21 to 27 August 2026, with the final day reserved as buffer.

| Day | Focus | Output |
| --- | --- | --- |
| D1, 21 Aug | Foundation | Repository, both applications running, migrations and model, seeder, public endpoint live |
| D2, 22 Aug | CMS | Auth, full CRUD, image upload, reorder, publish toggle, backend tests |
| D3, 23 Aug | Frontend foundation | Design tokens, shared components, header, footer, hero, container, typography |
| D4, 24 Aug | Dynamic and static sections | Featured Properties wired to the API with skeleton and fallback, plus all static sections |
| D5, 25 Aug | Responsive polish | Three breakpoint testing, accessibility, performance, revalidation, end to end tests |
| D6, 26 Aug | Documentation and buffer | README, screenshots, final cleanup, self review |
| 27 Aug | Submit | Send the GitHub link to the HR team in the morning |

Buffer rule: if the schedule slips, what gets cut is end to end test coverage and animation, never the quality of the dynamic section or responsive correctness.

---

## 11. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Time drained chasing visual similarity with the existing site | High | This is a redesign, not a clone. Lock design tokens first, then build each component once and reuse it |
| No quality image assets available | Medium | Prepare a set of freely licensed WebP placeholders on D1 and commit them to the repository |
| Cross application configuration eats time | Medium | Settle it on D1 with a correct `.env.example` and a health check endpoint |
| Scope creeping into making other sections dynamic | Medium | The brief asks for one section. Others use typed static content that is easy to promote later |
| The reviewer cannot run the project | High | Test the README from a fresh clone on D6. Include demo credentials and the seed command |
| Heavy images drag down the performance score | Medium | Cap upload size, ship WebP, size images per breakpoint, and prioritise only the hero |

---

## 12. Future Work

Out of scope for the test, but the architecture is already prepared for it:

1. Promoting other static sections to dynamic using the same pattern, starting with Special Offers.
2. A property detail page, using the slug already stored.
3. Centralised media management and responsive image variants.
4. Roles and permissions, a draft and review flow, and scheduled publishing.
5. Indonesian and English localisation.
6. Migrating content from the existing WordPress instance.

---

## Appendix A. Glossary

| Term | Meaning |
| --- | --- |
| Dynamic section | A homepage section whose data comes from the database and is managed through the CMS |
| Static section | A section whose data is a typed constant inside the frontend code |
| ISR | Incremental Static Regeneration, static pages refreshed periodically without a rebuild |
| Revalidation | Dropping a page cache so the latest data is rendered |
| Soft delete | Deletion by marking a timestamp rather than physically removing the row |
