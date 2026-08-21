# Technical Design - iNi ViE Hospitality Homepage Redesign

| Field | Value |
| --- | --- |
| Document type | Technical Design Document |
| Version | 1.0 |
| Date | 21 August 2026 |
| Status | Living document. Expected to change during implementation |

**Scope of this document.** How the product described in [PRD.md](./PRD.md) is built. It owns architecture, stack decisions, CMS implementation, rendering strategy, repository structure, non-functional implementation, security, and testing.

It deliberately does not own: the database schema ([DATA-MODEL.md](./DATA-MODEL.md)), the API contract ([API-SPEC.md](./API-SPEC.md)), or visual tokens ([DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)).

---

## 1. Architecture

### 1.1 Flow

```
                    ┌──────────────────────────────┐
   Visitor    ───►  │  Next.js (App Router)        │
                    │  Port 3000                   │
                    │  - Homepage, Server          │
                    │    Components                │
                    │  - ISR, revalidate 60s       │
                    └───────────┬──────────────────┘
                                │ HTTP GET (JSON)
                                │ /api/v1/properties
                                ▼
                    ┌──────────────────────────────┐
   CMS admin  ────► │  Laravel 12                  │
   (browser)        │  Port 8000                   │
                    │  - /admin  (Blade, session)  │
                    │  - /api/v1 (JSON, public)    │
                    │  - /storage (images)         │
                    └───────────┬──────────────────┘
                                │ Eloquent
                                ▼
                    ┌──────────────────────────────┐
                    │  MySQL 8                     │
                    └──────────────────────────────┘

   After an admin saves a change, Laravel calls
   POST {NEXT_URL}/api/revalidate   → homepage cache is dropped
```

### 1.2 Responsibility boundaries

| Component | Responsible for | Must not |
| --- | --- | --- |
| Next.js | Rendering, layout, accessibility, image optimisation, page caching | Touch MySQL, or hold content business rules |
| Laravel | Source of truth for content, validation, authorisation, file storage, API payload shape | Render public pages |
| MySQL | Persistence | - |

### 1.3 The contract between layers

The Laravel API Resource is the single contract. The payload shape is defined once in `PropertyResource` and mirrored as a TypeScript type in `types/property.ts`. Any change to the payload shape must update both in the same commit. The contract itself is documented in [API-SPEC.md](./API-SPEC.md).

This is the direct countermeasure to the production defect recorded in PRD ch. 2.3, where the frontend asked for author data the API would never return and nothing detected it.

---

## 2. Stack Decisions

### 2.1 Selection

| Layer | Technology | Target version |
| --- | --- | --- |
| Frontend | Next.js App Router + TypeScript | Next 15.x, React 19 |
| Styling | Tailwind CSS | 4.x |
| Backend and CMS | Laravel | 12.x, PHP 8.3+ |
| Database | MySQL | 8.0 |
| CMS auth | Minimal Laravel session auth (Breeze style) | - |
| Admin UI | Blade + Tailwind CSS | - |
| Image storage | Laravel filesystem, `public` disk | - |
| Backend tests | Pest | - |
| Frontend tests | Vitest + Testing Library, Playwright | - |
| PHP formatting | Laravel Pint | - |
| JS formatting and linting | ESLint + Prettier | - |

### 2.2 Rationale

Option 2 aligns with the already decoupled production architecture of inivie.com. Conceptually swapping headless WordPress for headless Laravel is a drop-in change on the frontend as long as the API contract is respected.

Decoupling also allows each side to be optimised independently: the frontend for Core Web Vitals through ISR and image optimisation, the CMS for editor ergonomics. Each can be deployed and scaled on its own.

### 2.3 Decisions considered and rejected

| Decision | Rejected alternative | Reasoning |
| --- | --- | --- |
| Custom Blade admin panel | Filament or Nova | This test evaluates code quality. A generated panel hides exactly the controllers, validation, and authorisation the reviewer wants to see. A hand written Blade panel stays small because the scope is a single resource |
| Session auth for the admin, public read-only API with no auth | Sanctum with a separate admin SPA | **Verified to match production behaviour** (PRD ch. 2.2): `wp/v2/posts` is open to anonymous callers, `wp/v2/users` returns 401, and `/wp-admin` uses a session cookie. Beyond that, adding a whole SPA for one CRUD resource is over-engineering, and homepage data is public so read endpoints need no token |
| Two applications in one repository | Two separate repositories | The brief asks for one GitHub link. The reviewer clones once |
| ISR with on-demand revalidation | Full SSR on every request | The homepage changes rarely and is image heavy. ISR delivers static-like time to first byte while keeping data fresh |
| Images on the Laravel `public` disk | Base64 in a database column, or S3 | Base64 wrecks query performance and caching. S3 adds a credential dependency that makes the project harder for a reviewer to run |
| Typed static content modules for non-dynamic sections | Hardcoded markup in components | Keeps every section one step away from becoming dynamic, and keeps copy edits out of layout code |

---

## 3. Rendering and Caching Strategy

### 3.1 Rendering

The homepage is a Server Component tree. `use client` appears in exactly two places: the mobile navigation drawer and the FAQ accordion. The Featured Properties section holds no client state, so it ships zero additional JavaScript.

### 3.2 Caching

| Layer | Mechanism |
| --- | --- |
| Laravel response | `Cache-Control: public, max-age=60` (see API-SPEC ch. 5) |
| Next.js fetch | `next: { revalidate: 60, tags: ['properties'] }` |
| Next.js page | Incremental Static Regeneration |

### 3.3 On-demand revalidation

After a successful create, update, delete, or reorder, a Laravel service issues a `POST` to the frontend revalidation endpoint with a shared secret. The route handler calls `revalidateTag('properties')`, which drops the cached homepage so the next visitor sees fresh content immediately rather than waiting out the 60 second window.

**Failure policy.** A failed revalidation must never fail the CMS operation. It is logged and swallowed, because the time to live already guarantees eventual consistency. An editor should never see a save fail because the frontend happened to be down.

### 3.4 Degradation

The behaviour requirements F4 and F5 in PRD ch. 6.2 are implemented as follows:

| Condition | Implementation |
| --- | --- |
| Empty result set | The section component returns `null`, so heading and container disappear together |
| API unreachable or 5xx | The fetch wrapper catches, logs server side, and returns an empty result with an error flag. The section renders a short fallback line instead of the grid |
| Slow response | The section is wrapped in `Suspense` with a three card skeleton matching the final card dimensions, so there is no layout shift |

---

## 4. Frontend Design

### 4.1 Composition

- `app/page.tsx` composes section components in order and holds no logic.
- Section components own their own data access and are individually replaceable.
- `components/ui/*` holds primitives shared across sections: `Button`, `Card`, `Badge`, `Container`, `SectionHeading`.
- `lib/api/properties.ts` is the only module that knows the API base URL and response shape.

### 4.2 Static content modules

Every static section reads from a typed module in `content/`. For example `content/culinary.ts` exports a typed array consumed by the culinary section. Promoting a section to dynamic later means replacing that import with a fetch, without touching the component's markup.

### 4.3 Images

`next/image` everywhere, with per breakpoint `sizes` so mobile never downloads desktop assets. The hero image carries `priority`; every other image is lazy. The CMS host is allowlisted in `next.config.ts` under `images.remotePatterns`.

---

## 5. CMS Implementation

### 5.1 Access and authentication

- URL: `http://localhost:8000/admin`
- Laravel session authentication with an email and password form, protected by the built in login rate limiter.
- A single role, admin. Demo credentials are documented in the README.
- Every admin route sits behind the `auth` middleware. Visiting an admin URL without a session redirects to the login page.

### 5.2 Routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/admin/login` | GET, POST | Login screen and submission |
| `/admin` | GET | Dashboard with published and draft counts |
| `/admin/properties` | GET | Index table with thumbnail, title, category, status, order, actions |
| `/admin/properties/create` | GET | Create form |
| `/admin/properties` | POST | Store |
| `/admin/properties/{id}/edit` | GET | Edit form with a preview of the current image |
| `/admin/properties/{id}` | PUT | Update |
| `/admin/properties/{id}` | DELETE | Delete, behind a confirmation modal |
| `/admin/properties/{id}/publish` | PATCH | Publish toggle as a row level quick action |
| `/admin/properties/reorder` | POST | Persist a new ordering as one batch |

### 5.3 Validation rules

Enforced through `StorePropertyRequest` and `UpdatePropertyRequest`, never inline in the controller.

| Field | Rules |
| --- | --- |
| `title` | required, string, max 120 |
| `slug` | required, alpha dash, max 140, unique ignoring the current record |
| `category` | required, one of the enum values |
| `location` | required, max 120 |
| `excerpt` | required, max 240 |
| `image` | required on create, optional on update, mime `jpg,jpeg,png,webp`, max 2 MB, minimum dimensions 800x600 |
| `image_alt` | required, max 160 |
| `price_from` | optional, integer, min 0 |
| `rating` | optional, numeric, between 0 and 5 |
| `cta_url` | optional, valid URL |
| `sort_order` | required, integer, min 0 |
| `is_published` | boolean |

Validation failures return the user to the form with old input and per field error messages, satisfying capability C8 in PRD ch. 7.1.

### 5.4 Image handling

- Uploads are stored in `storage/app/public/properties` under hashed filenames.
- Files are served publicly through the `php artisan storage:link` symlink.
- On update with a new image, the old file is deleted only after the record saves successfully, inside the same transaction. If the save fails, the original file survives.
- Deleting a property is a soft delete, so its image is retained. Files are removed only on force delete.
- No server side resizing. Size optimisation is handled by `next/image`. The 2 MB cap and minimum dimensions already protect quality and storage.

`PropertyImageStore` owns all of this. Controllers never touch the filesystem directly.

### 5.5 Reordering

The index page allows editing the order column inline. Submission sends the full ordered list of ids and is applied inside a database transaction, so a partial failure cannot leave a half reordered list.

---

## 6. Security Implementation

Implements requirements S1 to S5 in PRD ch. 8.5.

| Area | Implementation |
| --- | --- |
| Admin auth | Laravel sessions, bcrypt password hashing, login rate limiting |
| CSRF | Enabled on every admin form, including the delete and publish toggle actions |
| Uploads | Mime and size validation, hashed filenames, stored under `storage/` rather than in the code directory |
| Public API | Read only. Mutation routes are never registered under `/api/v1`. Rate limited to 60 requests per minute per IP |
| CORS | Only the frontend origin is allowed, configured through an environment variable, never a wildcard. Mirrors production, which sends `Access-Control-Allow-Origin: https://inivie.com` |
| Indexing | API responses send `X-Robots-Tag: noindex`, matching production |
| Secrets | All through `.env`, with a committed `.env.example` and `.env` in gitignore |
| Revalidation endpoint | Requires a shared secret, rejects with 401 on mismatch |
| Mass assignment | Explicit `$fillable` plus Form Requests. Never `Model::create($request->all())` |

---

## 7. Non-Functional Implementation

### 7.1 Meeting the performance targets

The targets are in PRD ch. 8.2. They are met by:

- Server Components for everything except the two interactive widgets.
- ISR, so a visitor almost always hits a pre-rendered page.
- WebP images, sized per breakpoint, with `priority` reserved for the hero.
- Fonts loaded through `next/font/google` with `display: swap` and a latin subset, which removes both layout shift and any runtime third party request.
- Skeletons dimensioned to match final content, which keeps layout shift near zero.

### 7.2 Meeting the SEO targets

Next.js Metadata API for title, description, Open Graph, and Twitter cards. Static `robots.txt` and a generated `sitemap.xml`. One `h1` on the page, with section headings as `h2` and card titles as `h3`. `Organization` JSON-LD in the root layout. A canonical URL from an environment variable.

### 7.3 Meeting the accessibility targets

Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`). Alternative text is guaranteed non-empty because `image_alt` is a required CMS field, which is the reason it is modelled as `not null` rather than nullable. The FAQ accordion uses native `details` and `summary` so it is keyboard operable without custom JavaScript. The mobile drawer traps focus and closes on Escape. Contrast pairings are validated against the token table in DESIGN-SYSTEM ch. 2.

---

## 8. Repository Structure

```
inivie-homepage-redesign/
├── README.md                  setup steps, technical decisions, screenshots
├── .gitignore
├── docs/
│   ├── PRD.md
│   ├── TECHNICAL-DESIGN.md
│   ├── DATA-MODEL.md
│   ├── API-SPEC.md
│   └── DESIGN-SYSTEM.md
│                              the original brief PDF is kept locally and
│                              gitignored, since it is the client's document
│                              rather than project output
├── cms/                       Laravel application
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Admin/PropertyController.php
│   │   │   │   ├── Admin/PropertyOrderController.php
│   │   │   │   ├── Admin/PropertyPublishController.php
│   │   │   │   ├── Auth/LoginController.php
│   │   │   │   └── Api/V1/PropertyController.php
│   │   │   ├── Requests/StorePropertyRequest.php
│   │   │   ├── Requests/UpdatePropertyRequest.php
│   │   │   └── Resources/PropertyResource.php
│   │   ├── Models/Property.php
│   │   └── Services/
│   │       ├── PropertyImageStore.php     stores and removes files
│   │       └── FrontendRevalidator.php    calls the Next.js webhook
│   ├── database/{migrations,factories,seeders}/
│   ├── resources/views/{layouts,admin,auth}/
│   ├── routes/{web.php,api.php}
│   └── tests/{Feature,Unit}/
└── web/                       Next.js application
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   └── api/revalidate/route.ts
    │   ├── components/
    │   │   ├── layout/{Header,MobileNav,Footer}.tsx
    │   │   ├── sections/{Hero,FeaturedProperties,Culinary,...}.tsx
    │   │   └── ui/{Button,Card,Badge,Container,SectionHeading}.tsx
    │   ├── content/           typed static content
    │   ├── lib/api/properties.ts
    │   └── types/property.ts
    ├── e2e/
    └── public/
```

Naming principles: components in PascalCase, folders in kebab-case, one component per file, and no `utils.ts` dumping ground.

---

## 9. Testing Strategy

### 9.1 Automated tests

| Layer | Tooling | Minimum coverage |
| --- | --- | --- |
| Laravel feature | Pest | The public endpoint returns only published properties in the correct order, `limit` and `category` are validated, admin CRUD works end to end, guests are rejected from admin routes, validation rules hold, and the old file is deleted on image update |
| Laravel unit | Pest | The `published_at` transition rule and slug generation (see DATA-MODEL ch. 3) |
| Next.js component | Vitest + Testing Library | The property card renders every field, and hides price and rating when null |
| Next.js end to end | Playwright | The homepage loads and shows cards, the section is hidden on empty data, the fallback appears when the API is down, and the mobile navigation opens and closes |

### 9.2 Manual QA before submission

1. Setup from a fresh clone following the README, with no hidden steps.
2. Add a new property in the CMS, then see it on the homepage after a refresh.
3. Edit a property and see the change reflected on the homepage.
4. Unpublish a property and see its card disappear.
5. Delete a property and see it disappear without errors.
6. Change the ordering and see the card order follow on the homepage.
7. Upload an oversized image and get a clear error message.
8. Stop the Laravel server and confirm the homepage still renders with a clean fallback.
9. Test at 375px, 768px, and 1440px.
10. Test full keyboard navigation from header to footer.
11. Run Lighthouse and axe, and record the scores.

### 9.3 Quality gates

`npm run lint`, `npm run typecheck`, `./vendor/bin/pint --test`, and the full test suite must be green before the final commit. No skipped tests and no tolerated lint warnings.
