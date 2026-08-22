# Technical Design - iNi ViE Hospitality Homepage Redesign

| Field | Value |
| --- | --- |
| Document type | Technical Design Document |
| Version | 1.1 |
| Date | 22 August 2026 |
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
   CMS admin  ────► │  Laravel 13                  │
   (browser)        │  Port 8000                   │
                    │  - /admin  (Blade, session)  │
                    │  - /api/v1 (JSON, public)    │
                    │  - /storage (images)         │
                    └───────────┬──────────────────┘
                                │ Eloquent
                                ▼
                    ┌──────────────────────────────┐
                    │  MySQL 8.4 LTS               │
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

Versions verified against the npm registry, Packagist, the Laravel support policy, and endoflife.date on **22 August 2026**.

| Layer | Technology | Target version | Latest stable at verification |
| --- | --- | --- | --- |
| Frontend | Next.js App Router | 16.x | 16.3.2 |
| UI runtime | React | 19.x | 19.2.8 |
| Language | TypeScript | whatever `create-next-app` scaffolds | 7.0.2 |
| Styling | Tailwind CSS | 4.x | 4.3.3 |
| Node runtime | Node.js | 24 LTS | 26 released, LTS from 28 Oct 2026 |
| Backend and CMS | Laravel | 13.x | 13.26.1 |
| PHP runtime | PHP | 8.5.x | 8.5.9 |
| Database | MySQL | 8.4 LTS | 8.4.11, and 9.7 LTS |
| CMS auth | Minimal Laravel session auth (Breeze style) | - | - |
| Admin UI | Blade + Tailwind CSS | - | - |
| Image storage | Laravel filesystem, configured disk. `public` for this project, see ch. 5.5 | - | - |
| Backend tests | Pest | 4.x | 4.7.8 |
| Frontend tests | Vitest + Testing Library, Playwright | - | - |
| PHP formatting | Laravel Pint | - | - |
| JS formatting and linting | ESLint + Prettier | - | - |

### 2.1.1 Version policy and why these numbers

The rule is: take the current stable major of each dependency, and never start a new project on a version that has already left support.

| Choice | Reasoning |
| --- | --- |
| **Laravel 13**, not 12 | Laravel 12's bug fix window closed on **13 August 2026**, nine days before this project started. Beginning a greenfield build on a release that no longer receives bug fixes is indefensible in review. Laravel 13 shipped 17 March 2026, so it has five months of patch releases behind it and is not bleeding edge |
| **PHP 8.5**, not 8.3 | Laravel 13 supports 8.3 to 8.5. PHP 8.3 left active support on 31 December 2025 and is security-only. PHP 8.4 leaves active support on 31 December 2026, inside this project's plausible lifetime. 8.5 is the only option in Laravel's supported window with active support running to the end of 2027 |
| **Next.js 16**, not 15 | Next 16 shipped 22 October 2025 and is ten months mature at 16.3.2. Next 15 still receives patches but is the previous major |
| **Node 24 LTS**, not 26 | Next 16 only requires Node 20.9 or newer, so this is a free choice. Node 26 exists but does not enter long term support until 28 October 2026. 24 is the current LTS |
| **MySQL 8.4 LTS**, not 8.0 | MySQL 8.0 reached end of life on **30 April 2026**. 8.4 is LTS with support to 2032 and is what most local development stacks ship by default, which matters for acceptance criterion A15. MySQL 9.7 LTS also works if the reviewer already runs it |
| **TypeScript unpinned** | The TypeScript major line moved quickly this year, with 6.0.3 in April 2026 and 7.0.2 current. Rather than hardcode a major that may shift again before submission, take whatever `create-next-app` scaffolds, which is the version the framework itself is tested against |

Two of the versions originally drafted for this document, Laravel 12 and MySQL 8.0, were already out of support when checked. That is the reason this table records a verification date and a latest-stable column rather than a bare version number: a spec that states versions without saying when they were true silently rots.

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
| Images on a local filesystem disk **for this test**, behind a swappable seam | Base64 in a database column, or object storage from day one | Base64 wrecks query performance and caching, so it is rejected outright. Object storage is rejected only for now: it needs credentials the reviewer does not have, which puts acceptance criterion A15 at risk. Production inivie.com does serve media through a CDN (PRD ch. 2.2), so the move is a real one, just not this week. Ch. 5.5 keeps it a configuration change rather than a rewrite |
| Typed static content modules for non-dynamic sections | Hardcoded markup in components | Keeps every section one step away from becoming dynamic, and keeps copy edits out of layout code |

### 2.4 Local development environment

**PHP and MySQL run in Docker. Node runs natively.**

| Part | How it runs | Why |
| --- | --- | --- |
| `cms/` and MySQL | Docker Compose | Pins PHP 8.5 and MySQL 8.4 exactly, with no PHP installation on the developer's machine. Installing PHP on Windows means enabling extensions by hand, and MySQL installers routinely leave conflicting services behind |
| `web/` | Native `npm run dev` | Next watches thousands of files. Through a Windows bind mount that is slow and hot reload misfires. Running it natively costs nothing, because Node is already the exact target version |

Splitting the two is not a compromise. The Laravel container only runs `artisan serve`, so bind mount latency barely touches it, while a Next dev server is precisely the workload it punishes.

#### Two setup paths, both supported

A reviewer with PHP and MySQL already installed must be able to ignore Docker entirely. That property does not come for free, and it is not a property of the tooling choice: Sail could be skipped just as easily. What makes it true is that **no Docker knowledge leaks into application code**. No container hostnames in `config/`, no environment-specific helpers, storage paths left standard.

Three rules keep both paths working:

| Rule | Mechanism |
| --- | --- |
| `.env` is the single source for the database host | `.env.example` ships `DB_HOST=mysql`, the Compose service name, because Docker is the verified path. A reviewer using their own MySQL changes that one line to `127.0.0.1`. Nothing else differs between the two paths |
| A busy port does not block the Docker path | The published MySQL port is `${FORWARD_DB_PORT:-3306}:3306`, so a reviewer already running MySQL on 3306 sets one variable instead of debugging a bind failure |
| Application code stays Docker-unaware | The compose file is environment, not architecture. Deleting it must leave a working Laravel application |

##### Why not set `DB_HOST` in the compose file

The obvious design is to keep `.env.example` pointing at `127.0.0.1` for the native path and let Compose export `DB_HOST=mysql`, so neither reviewer edits anything. That was the original plan here, and **it does not work**.

`artisan serve` does not hand its environment to the server it starts. `Illuminate\Foundation\Console\ServeCommand::$passthroughVariables` is an explicit allowlist of fourteen variables, and `DB_HOST` is not among them, so it is stripped from the subprocess. The subprocess then reads `.env`.

The failure mode is worse than a plain error, because it is inconsistent:

| Path | Host used | Result |
| --- | --- | --- |
| `artisan migrate`, `artisan tinker` | the container variable, `mysql` | works |
| An actual HTTP request | `.env`, `127.0.0.1` | connection refused |

Migrations succeed, the console reports a healthy database, and only real traffic fails. That is a bad afternoon to debug.

Two details make this worth recording rather than quietly fixing. `LARAVEL_SAIL` **is** on that allowlist, which is the tell: Sail does not rely on environment override either, it writes `DB_HOST=mysql` into `.env` during install. And the same stripping cost real time here in a second way, since the refused connection waited out a TCP timeout on every request, which first looked like Windows bind mount latency rather than a configuration fault.

#### Compose scope

Two services, `app` and `mysql`, in a file short enough to read in full. Laravel Sail was considered and set aside: it is the ecosystem convention and instantly recognisable, but it generates configuration rather than expressing a decision, and its defaults carry services this project has no use for. In a test that grades code quality, a short file that a reviewer can read end to end is the better artefact.

`php artisan serve` is used rather than nginx with php-fpm. A reverse proxy would add a container and a config file to serve a single local application, buying nothing that matters before production.

#### Why the app service needs a Dockerfile

`php:8.5-cli` cannot be used as-is. Inspected on 22 August 2026, the image resolves to PHP 8.5.9 and already carries every extension Laravel requires (`ctype`, `curl`, `dom`, `fileinfo`, `filter`, `hash`, `mbstring`, `openssl`, `pcre`, `PDO`, `session`, `tokenizer`, `xml`), but it ships **`pdo_sqlite` and no `pdo_mysql`**. Pointing the compose file straight at the image would start cleanly and then fail on the first query.

So the `app` service builds from a Dockerfile that does three things:

| Step | Reason |
| --- | --- |
| `docker-php-ext-install pdo_mysql` | The one genuinely missing PHP extension. Everything else Laravel needs is already in the base image, so nothing more is added |
| `apt-get install unzip` | Composer unpacks dist archives with the `zip` extension or, failing that, the `unzip` binary. The base image has neither, so `composer require` aborts with `The zip extension and unzip/7z commands are both missing`. `unzip` is the smaller of the two fixes: one apt package against a PHP extension that would also pull in `libzip-dev` |
| Copy `composer` in from the `composer:2` image | Keeps Composer at a pinned version and avoids an install script, so no Composer is needed on the host either |

The Dockerfile stays deliberately thin. Every line added to it is a line a reviewer has to read to trust the environment, so extensions are installed because a dependency needs them, never speculatively. `unzip` earned its line on 22 August 2026, when installing Pest was the first command to need it.

#### Verification status

Both paths are documented, but only what has actually been run can be claimed as working. The README marks each path as verified or unverified, and A15 is only satisfied by a path that has genuinely been executed from a fresh clone.

Run on 22 August 2026:

| Check | Result |
| --- | --- |
| `docker compose up -d --build` | Both services up, `mysql` reports healthy before `app` starts |
| Resolved stack | Laravel 13.26.1, PHP 8.5.9, MySQL 8.4.11 |
| `artisan migrate` | All three framework migrations ran against MySQL |
| `artisan migrate:fresh --seed` | Re-run 22 August 2026 with the `properties` migration and seeder. Schema matches DATA-MODEL ch. 2 column for column, including the `enum`, `char(3)`, `decimal(2,1)` and all three indexes |
| `artisan test` | 25 Pest tests green. The suite runs on SQLite in memory per `phpunit.xml`; the migration is additionally verified against MySQL by the row above |
| `vendor/bin/pint --test` | Clean across 35 files |
| `GET localhost:8000` | `200`, 1.65s cold and roughly 50ms warm |
| Native path | **Not verified.** This machine has no PHP or MySQL |

The warm figure is the useful one. At ~50ms through a Windows bind mount, the earlier claim that `artisan serve` is barely affected by bind mount latency holds, and no volume tuning is warranted.

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

`next/image` everywhere, with per breakpoint `sizes` so mobile never downloads desktop assets. The hero image carries `priority`; every other image is lazy.

The media host is allowlisted in `next.config.ts` under `images.remotePatterns`, built from `NEXT_PUBLIC_MEDIA_HOST` rather than written as a literal. This keeps the frontend half of the storage seam in ch. 5.5 honest: `next/image` refuses to load a host that is not allowlisted, so a hardcoded pattern would turn a one-line storage change into every property image silently failing to render.

`next/image` also does the work a transformation CDN would otherwise be bought for, converting to modern formats and emitting per breakpoint sizes on demand. That is why the local disk choice costs the homepage nothing in image quality or weight.

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

- Uploads go to the `properties/` prefix on the configured disk, under hashed filenames.
- For this project the configured disk is `public`, served through the `php artisan storage:link` symlink.
- On update with a new image, the old file is deleted only after the record saves successfully, inside the same transaction. If the save fails, the original file survives.
- Deleting a property is a soft delete, so its image is retained. Files are removed only on force delete.
- No server side resizing. Size optimisation is handled by `next/image`. The 2 MB cap and minimum dimensions already protect quality and storage.

`PropertyImageStore` owns all of this. Controllers never touch the filesystem directly.

### 5.5 The storage seam

Local disk is the right choice for this test, not the right choice forever. Production inivie.com already serves media through a CDN (PRD ch. 2.2). So the storage location is treated as a configuration value from the start, and moving to object storage later must be a config change rather than a rewrite.

Three rules make that true. Each is cheap now and expensive to retrofit.

| Rule | Why it is the load-bearing one |
| --- | --- |
| **`image_path` stores a relative path, never a URL** | A stored URL bakes the host into every row. Changing storage would then need a data migration to rewrite them, and any row missed stays broken forever. A relative path is location independent, so the same rows work on any disk |
| **The absolute URL is derived once, in `PropertyResource`, via `Storage::url()`** | Laravel's filesystem abstraction already knows how to build a URL for whichever disk is configured. One derivation point means one place to change, and consumers never learn where the bytes live |
| **`PropertyImageStore` is the only code that touches storage** | A controller that reaches for the filesystem directly is a second seam nobody remembers to move |

**Configuration.** The disk name and the frontend's media host are environment values, never literals in code.

| Variable | App | This project | After a move to object storage |
| --- | --- | --- | --- |
| `FILESYSTEM_DISK` | `cms/` | `public` | `s3` |
| `APP_URL` | `cms/` | `http://localhost:8000` | unchanged |
| `NEXT_PUBLIC_MEDIA_HOST` | `web/` | `localhost:8000` | the CDN or bucket host |

`next.config.ts` builds `images.remotePatterns` from `NEXT_PUBLIC_MEDIA_HOST` rather than hardcoding a host. A hardcoded pattern is the failure that turns a one-line storage change into every image on the homepage silently failing to render, because `next/image` refuses hosts that are not allowlisted.

**What the move would then cost:** set `FILESYSTEM_DISK=s3`, add the bucket credentials, point `NEXT_PUBLIC_MEDIA_HOST` at the CDN. No migration, no code change, no touched rows.

### 5.6 Reordering


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
├── AGENTS.md                  conventions for agents working in this repo
├── CLAUDE.md                  one-line pointer to AGENTS.md
├── .gitignore
├── .gitattributes
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
│   ├── docker-compose.yml     app + mysql, the only Docker in the repo
│   ├── Dockerfile             php:8.5-cli + pdo_mysql + unzip + composer
│   ├── .env.example           defaults to the native path; Compose overrides
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
│   │   ├── Enums/PropertyCategory.php
│   │   ├── Models/Property.php
│   │   ├── Observers/PropertyObserver.php
│   │   └── Services/
│   │       ├── PropertyImageStore.php     stores and removes files
│   │       └── FrontendRevalidator.php    calls the Next.js webhook
│   ├── database/{migrations,factories,seeders}/
│   ├── resources/views/{layouts,admin,auth}/
│   ├── routes/{web.php,api.php}
│   └── tests/{Feature,Unit}/
└── web/                       Next.js application
    ├── .env.example
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
