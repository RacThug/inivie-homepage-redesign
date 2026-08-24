# Technical Design - iNi ViE Hospitality Homepage Redesign

| Field | Value |
| --- | --- |
| Document type | Technical Design Document |
| Version | 1.2 |
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
   POST {FRONTEND_INTERNAL_URL}/api/revalidate  → homepage cache is dropped
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
| Carousel | `embla-carousel-react` | 8.x | 8.6.0, verified 23 August 2026 |
| Frontend tests | Vitest + Testing Library, Playwright | 4.x | 4.1.11 |
| DOM for component tests | jsdom | 29.x | 30.0.1 |
| PHP formatting | Laravel Pint | - | - |
| JS linting | ESLint + `eslint-config-next` | 9.x | 10.9.0 |
| JS formatting | Prettier | 3.x | 3.9.6 |

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
| **ESLint 9**, not 10 | Tried and reverted on 22 August 2026. `eslint-config-next@16.3.2` bundles a copy of `eslint-plugin-react` that calls the pre-10 rule context API, so every lint run aborts with `contextOrFilename.getFilename is not a function`. ESLint 9 is on the maintenance line rather than out of support, and the reasoning from the TypeScript row applies unchanged: take the version the framework is actually tested against. Revisit when `eslint-config-next` ships a 10-compatible plugin |
| **Embla 8**, not 9 | Checked 23 August 2026: `embla-carousel-react` publishes 8.6.0 on `latest` and 9.0.0-rc03 on `next`. A release candidate is not a stable major, and the rule above says take the current stable one. The SSR plugin exists only on the 9 line, which costs this project nothing: the slide widths are CSS rather than JavaScript, so the track is laid out correctly before the carousel initialises and there is no width for a plugin to supply |
| **jsdom 29**, not 30 | jsdom 30 requires Node `^24.15.0`, which would refuse to run the component tests for any reviewer on an earlier Node 24 patch. 29.1.1 supports the whole of Node 24. Acceptance criterion A15 is about a setup that works from a fresh clone, and a test suite that depends on a specific patch release of the runtime works against it |

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

**PHP and MySQL run in Docker. Node runs natively, for both applications.** `cms/` compiles its own assets with Vite, so the split is by toolchain rather than by application. See the Node build step below.

| Part | How it runs | Why |
| --- | --- | --- |
| `cms/` and MySQL | Docker Compose | Pins PHP 8.5 and MySQL 8.4 exactly, with no PHP installation on the developer's machine. Both halves of that were measured on 24 August 2026 rather than assumed: a native PHP on Windows arrives with no `php.ini` and every extension switched off, and the MySQL MSI lays down a server with no data directory and no service. See the native verification below |
| `web/` | Native `npm run dev` | Next watches thousands of files. Through a Windows bind mount that is slow and hot reload misfires. Running it natively costs nothing, because Node is already the exact target version |

Splitting the two is not a compromise. The Laravel container only runs `artisan serve`, so bind mount latency barely touches it, while a Next dev server is precisely the workload it punishes.

#### Two setup paths, both supported

A reviewer with PHP and MySQL already installed must be able to ignore Docker entirely. That property does not come for free, and it is not a property of the tooling choice: Sail could be skipped just as easily. What makes it true is that **no Docker knowledge leaks into application code**. No container hostnames in `config/`, no environment-specific helpers, storage paths left standard.

Three rules keep both paths working:

| Rule | Mechanism |
| --- | --- |
| `.env` is the single source for every address that differs between the paths | `.env.example` ships `DB_HOST=mysql` and `FRONTEND_INTERNAL_URL=http://host.docker.internal:3000`, both Compose values, because Docker is the verified path. A reviewer running natively changes those two lines to `127.0.0.1` and `http://localhost:3000`. Nothing else differs |
| A busy port does not block the Docker path | The published MySQL port is `${FORWARD_DB_PORT:-3306}:3306`, so a reviewer already running MySQL on 3306 sets one variable instead of debugging a bind failure |
| Application code stays Docker-unaware | The compose file is environment, not architecture. Deleting it must leave a working Laravel application |

`FRONTEND_INTERNAL_URL` is the second of those two lines and it exists for a reason worth stating on its own: it is not a duplicate of `FRONTEND_URL`. CORS compares `FRONTEND_URL` against the origin a browser presents, which is `http://localhost:3000` on both paths. The revalidation callback opens a socket, and inside the container `localhost` is the container. Collapsing them into one variable makes one of the two wrong, and which one depends on the path.

##### "Nothing else differs" is about `.env`, not about setup

The rule above governs addresses inside the application's configuration, and it holds. What it does not cover is the work Compose does *around* the application, which on the native path becomes the reviewer's: the `mysql` service creates the database and its user from `MYSQL_DATABASE`, `MYSQL_USER` and `MYSQL_PASSWORD`, and the `app` service's `command:` is what runs `php artisan serve`. Neither is a line in `.env` and neither is a command anybody types on the Docker path, so both are absent from the block a native reviewer would otherwise copy.

The README carries them explicitly for that reason: a `CREATE DATABASE` and a `GRANT` before the migration, and an `artisan serve` after it. #32 is where this surfaced. The native instructions had been written as "the Docker commands without the `docker compose exec` prefix", which is true of every line that is a command and silently drops the two things that never were.

##### Why not set `DB_HOST` in the compose file

The obvious design is to keep `.env.example` pointing at `127.0.0.1` for the native path and let Compose export `DB_HOST=mysql`, so neither reviewer edits anything. That was the original plan here, and **it does not work**.

`artisan serve` does not hand its environment to the server it starts. `Illuminate\Foundation\Console\ServeCommand::$passthroughVariables` is an explicit allowlist of fourteen variables, and `DB_HOST` is not among them, so it is stripped from the subprocess. The subprocess then reads `.env`. The same applies to `FRONTEND_INTERNAL_URL`, which is why that one is in `.env.example` too rather than in the compose file where a container hostname would otherwise belong.

The failure mode is worse than a plain error, because it is inconsistent:

| Path | Host used | Result |
| --- | --- | --- |
| `artisan migrate`, `artisan tinker` | the container variable, `mysql` | works |
| An actual HTTP request | `.env`, `127.0.0.1` | connection refused |

Migrations succeed, the console reports a healthy database, and only real traffic fails. That is a bad afternoon to debug.

Two details make this worth recording rather than quietly fixing. `LARAVEL_SAIL` **is** on that allowlist, which is the tell: Sail does not rely on environment override either, it writes `DB_HOST=mysql` into `.env` during install. And the same stripping cost real time here in a second way, since the refused connection waited out a TCP timeout on every request, which first looked like Windows bind mount latency rather than a configuration fault.

#### The CMS has a Node build step, on both paths

`cms/` runs on PHP, and compiles its own assets with Node. That is Laravel's own arrangement, not an addition here: `cms/vite.config.js` ships in the framework's scaffold, and `resources/css/app.css` is Tailwind. Vite compiles it into `cms/public/build/`, which `@vite()` reads from the Blade layout.

So the split in this chapter needs one clarification. **Node runs natively for `cms/` as well**, and for the same reason it does for `web/`. The Docker image is `php:8.5-cli` plus `pdo_mysql`, `unzip`, and Composer. It carries no Node and is not going to: adding a toolchain to an image so it can run one command at setup is a worse trade than documenting the command.

```
cd cms
npm install
npm run build      # writes public/build/
```

This is not a new prerequisite. Node is already required for `web/`, so both paths need it whether or not the reviewer uses Docker at all.

##### Why this is worth a paragraph rather than a README line

`cms/public/build/` is gitignored, so it is absent from a fresh clone. Skipping the build does not produce an error, a warning, or a failed request. Laravel starts, routes resolve, `/api/v1/properties` returns correct JSON, and `/admin` renders **unstyled HTML** with a 200 status.

A silent, correct-looking wrong result is the same failure shape as the `DB_HOST` problem recorded above, and it costs the same kind of afternoon. The API is unaffected because JSON needs no stylesheet, which is exactly why this stayed invisible until the first Blade screen was built.

#### One list of setup steps, and it is the README

`cms/composer.json` used to carry a `setup` script of its own: `composer install`, copy `.env`, `key:generate`, `migrate --force`, `storage:link`, `npm install --ignore-scripts`, `npm run build`. It was deleted in #32. The README setup chapter is now the only description of setup in the repository.

It was never a shortcut for the documented path. It was a second path that disagreed with the first, in three places at once:

| `composer setup` | The README block |
| --- | --- |
| Ran `npm install` and `npm run build` as part of the same command | Runs them on the host. The image is `php:8.5-cli` and carries neither `node` nor `npm`, verified 24 August 2026, so those two lines abort in the container |
| `migrate --force`, no seed | `migrate --seed`, which is what puts the eight properties and the admin account in the database |
| Carried `storage:link` until #27, and the `.env` copy until #32 | Carried neither, both times |

The last row is the argument. Both setup bugs found in this project are the same bug: a step that lived in the script, which nothing runs, and not in the README, which is the path a reviewer actually follows. The script being the more complete list is what made it harmless to look at and useless to run. No edit makes either list a superset of the other either, because the work is split between a container and the host by toolchain, so the script cannot hold the Node lines and still be one command. Two lists, one of which cannot run as written on the documented path, is worse than one list that has been executed.

The README's own two blocks, Docker and native, are not that failure repeated. They sit adjacent in one chapter, each describes a path a reviewer is meant to take, and the chapter above states what the second one has to do that the first does not. The thing deleted was a list in another file that nothing in the documentation invoked, which is what let it be more complete than the README and useless anyway.

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
| `artisan test` | 138 Pest tests green. The suite runs on SQLite in memory per `phpunit.xml`; the migration is additionally verified against MySQL by the row above |
| `vendor/bin/pint --test` | Clean across 62 files |
| `artisan storage:link` | Created. The `public` disk is served through this symlink, so it is in the README setup block. It was in the `composer setup` script alone until #27, which was a gap rather than a division of labour: the README's Docker path runs `composer install` and then artisan commands directly, so it never invoked `composer setup`, and a reviewer following it got a populated database and a 403 on every picture. An upload that lands correctly and 404s in the browser is the same silent, correct-looking failure as the two recorded above. That script is gone as of #32, per the chapter above |
| Admin property CRUD end to end | Signed in, created a property with a real upload, saw the thumbnail render from `/storage/properties/`, edited it, and cancelled a delete from the confirm modal. Chromium at 1440px and 375px, no console errors |
| `GET localhost:8000` | `200`, 1.65s cold and roughly 50ms warm |
| `GET /api/v1/properties` | The 3 published seed rows in `sort_order`, `max-age=60, public`, `X-Robots-Tag: noindex`, and `Access-Control-Allow-Origin: http://localhost:3000`. `?limit=13` and `?category=hostel` both `422`, `POST` `405` |
| `GET /api/v1/health` | `200 {"status":"ok","database":"connected"}` against MySQL, `Cache-Control: no-store` |
| Native path | **Verified separately on 24 August 2026**, in its own section below |

The warm figure is the useful one. At ~50ms through a Windows bind mount, the earlier claim that `artisan serve` is barely affected by bind mount latency holds, and no volume tuning is warranted.

##### The README block, run from a fresh clone

Run on 24 August 2026 for #32, from a `git clone` into an empty directory with no `.env`, no `vendor/`, no `node_modules/` and no `public/build/`, against its own Compose project and its own database volume so that nothing already set up on the machine could stand in for a missing step:

| Check | Result |
| --- | --- |
| `artisan key:generate` with no `.env` | **Fails, loudly.** `file_get_contents(/app/.env): Failed to open stream`, raised as an `ErrorException` at `KeyGenerateCommand.php:105`, exit code 1, no file written. #32 predicted a silent empty `.env` from reading the two guards on the lines below it; Laravel's error handler converts the warning into an exception before either guard is reached, so the setup stops there instead of continuing on a broken configuration. The better of the two outcomes, and the missing line is the same bug either way |
| `cp .env.example .env`, then the block in order | Every command green: `composer install`, `key:generate` (`APP_KEY` written into `.env`), `migrate --seed` (4 migrations, both seeders), `storage:link`, and `npm install && npm run build` on the host |
| `GET /api/v1/health` | `200 {"status":"ok","database":"connected"}` |
| `GET /api/v1/properties` | The 3 published seed rows, `max-age=60, public`, `X-Robots-Tag: noindex` |
| `GET /storage/properties/leedon-villa-seminyak.webp` | `200 image/webp`, 42,536 bytes. The seeded imagery of #27 arrives through the symlink with nothing downloaded |
| `GET /admin`, `GET /admin/login` | `302` to the login screen, then `200` serving the compiled `app-*.css` and `app-*.js` from `public/build/` |
| Native path | Run the same day, from its own fresh clone. Its record is the section below |

The Compose project was isolated on purpose. A verification run that borrows the database, the `vendor/` or the built assets sitting on the machine cannot tell a documented step from a step that happened to have been taken already, which is how a README passes review and fails a reviewer.

##### The native path, run the same day

Run on 24 August 2026 for #32, on Windows 11 with Docker stopped and out of the loop: PHP 8.5.8 (VS17 x64, winget `PHP.PHP.8.5`), Composer 2.10.2, MySQL 8.4.9 (winget `Oracle.MySQL`), Node already present. Its own fresh clone, its own database.

| Check | Result |
| --- | --- |
| Getting PHP to run at all | The install ships **no `php.ini`**. Without one, `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo_mysql` and `zip` are all off, so Composer cannot unpack a dist archive and Laravel cannot reach MySQL. Copying `php.ini-development` to `php.ini` and uncommenting `extension_dir` plus those six is the entire fix. It is in the README now |
| `pdo_sqlite` | The one the framework's required-extension list does not mention. `phpunit.xml` runs the suite on SQLite in memory, so without it all 192 tests error with `could not find driver` while the application itself serves perfectly. `php:8.5-cli` ships it, which is exactly why this could only surface here |
| Getting MySQL to run at all | The MSI lays down files and stops: no data directory, no service, nothing listening. `mysqld --initialize-insecure`, `mysqld --install`, then start it. Left on Manual startup so it does not fight Compose for 3306 at every boot |
| `CREATE DATABASE` and the `GRANT`, as the README writes them | Correct as written. `'inivie'@'localhost'` does match the TCP connection Laravel opens to `127.0.0.1`, which is the detail that could have made it wrong |
| The two edited `.env` lines | `DB_HOST=127.0.0.1` and `FRONTEND_INTERNAL_URL=http://localhost:3000`, and nothing else. The rule in the table above holds as stated |
| `composer install`, `key:generate`, `migrate --seed` | Green. 4 migrations, both seeders |
| `artisan storage:link` | Created, as an NTFS **junction** rather than a symlink. Laravel falls back to one on Windows, so neither administrator rights nor Developer Mode are needed. The failure everyone expects at this line does not happen |
| `npm install && npm run build` | The same `app-*.css` and `app-*.js` build hashes as the Docker run |
| `artisan test` | **192 passed**, 533 assertions, 8.9s. The container takes 31s for the same suite |
| `vendor/bin/pint --test` | Clean |
| `artisan serve`, then the API, image and admin checks | Identical to the Docker rows: health `200`, the 3 published rows with the same three headers, the seeded `.webp` at `200 image/webp` and 42,536 bytes, `/admin` `302` into a `200` login page serving the compiled assets |

Two things are worth keeping. **The application needed no change of any kind**, which turns ch. 2.4's claim about Docker-unaware code from an argument into a measurement. And every real obstacle was in the runtime rather than in this project: a PHP that installs with everything switched off, and an installer that lays down a database without starting one. That is the trade Docker buys, stated in the form of what it costs not to take it.

#### Frontend verification status

Run on 22 August 2026, natively on Node 24.13.0:

| Check | Result |
| --- | --- |
| Resolved stack | Next 16.3.2, React 19.2.8, Tailwind 4.3.3, TypeScript 5.9.3, Vitest 4.1.11 |
| `npm run lint` | Clean |
| `npm run typecheck` | Clean |
| `npm run format:check` | Clean |
| `npm test` | 81 Vitest tests green |
| `npm run build` | Compiled in 5.4s, homepage prerendered as static |
| `npm start`, then `GET localhost:3000` | `200`. Tokens, both fonts, and the reduced motion block all present in the served CSS |

The last row is the one worth keeping. A token can be declared in `globals.css`, pass every unit test, and still not reach the browser if Tailwind never picks the theme block up, so the compiled stylesheet was read rather than assumed.

---

## 3. Rendering and Caching Strategy

### 3.1 Rendering

The homepage is a Server Component tree, and `use client` is reserved for what genuinely needs a browser: the header's navigation and its mobile drawer, the search panel with its three fields and the calendar behind them, the hero's film, and the carousel, which three sections share. The eleven static sections and every card on the page render on the server.

The list is deliberately not a count. An earlier draft of this paragraph named two components and was four releases out of date before anyone read it again.

Featured Properties is the one section that reads the CMS, and the read stays on the server with everything it touches. The cards are rendered there and handed to the carousel as output rather than as data, which keeps them out of the client's module graph: the property payload, `PropertyCard`, `VenueCard` and `next/image` never reach a browser, and what ships is the carousel and nothing else. One component for three sections means it ships once.

The words on its controls cross that boundary as data, so they must be serialisable. `goTo` is a sentence with a `{name}` placeholder rather than the function it wants to be: React refuses a function at request time, which is a 500 on the homepage rather than a failing type check. `src/content/carousel.test.ts` is where that rule is enforced, because the component tests render the carousel on the client side of a boundary that is not there in a test.

### 3.2 Caching

| Layer | Mechanism |
| --- | --- |
| Laravel response | `Cache-Control: public, max-age=60` (see API-SPEC ch. 5) |
| Next.js fetch | `next: { revalidate: 60, tags: ['properties'] }` |
| Next.js page | Incremental Static Regeneration |

### 3.3 On-demand revalidation

After a successful create, update, delete, reorder, or publish toggle, `FrontendRevalidator` issues a `POST` to the frontend revalidation endpoint with a shared secret. The route handler expires the `properties` tag, which drops the cached homepage so the next visitor sees fresh content immediately rather than waiting out the 60 second window. The payload, the statuses and the route handler's own decisions are in API-SPEC ch. 5.2.

**`PropertyObserver` is the caller, not the controllers.** The five admin actions are two model events between them - `saved` covers create, update, reorder and the publish toggle, `deleted` covers the rest - so the record is fewer call sites than the screens, not more. It is also the seam that a Tinker session or a future bulk import arrives through, and those make the homepage exactly as stale as the edit form does.

**The call is queued for the commit, and coalesced.** `DB::afterCommit`, already the discipline in that observer for the file lifecycle, runs the call inline when there is no transaction and on commit when there is. A reorder writes its batch inside one (ch. 5.6), so without coalescing it would send a POST per row, and without the commit boundary it would have the frontend re-read the pre-write rows and cache those for another minute. The state that collapses a batch into one call lives in the service, which is why `AppServiceProvider` binds it as a singleton: the observer is resolved fresh for every event.

**Failure policy.** A failed revalidation must never fail the CMS operation. It is logged and swallowed, because the time to live already guarantees eventual consistency. An editor should never see a save fail because the frontend happened to be down.

**An unset `REVALIDATE_SECRET` turns it off.** The CMS then sends nothing and the homepage catches up on its own cache window. `phpunit.xml` pins the value empty for that reason: without the pin, every test that saves a property would post to whatever is listening on port 3000.

### 3.4 Degradation

The behaviour requirements F4 and F5 in PRD ch. 6.2 are implemented as follows:

| Condition | Implementation |
| --- | --- |
| Empty result set | The section component returns `null`, so heading and container disappear together |
| API unreachable or 5xx | The fetch wrapper catches, logs server side, and returns an empty result with an error flag. The section renders a short fallback line instead of the grid |
| Slow response | The section is wrapped in `Suspense` with a three card skeleton matching the final card dimensions, so there is no layout shift |

The empty case and the unreachable case both arrive as an empty list, which is why the result carries the flag as well: a bare array cannot tell "nothing is published" from "nothing answered", and the two have opposite answers.

The boundary sits above the read and the section's own chrome sits below it, so the heading and the pill paint before the API answers and only the grid waits.

**F4 is met in the rendering mode that ships.** The homepage is prerendered (`○ Static`, revalidate 60), so the read resolves before the document exists and the skeleton never reaches it: with nothing published the built HTML carries no Featured Properties section at all, verified by building against an emptied CMS and reading `.next/server/app/index.html`. The fallback lives only in the flight payload, as a branch nothing takes. Streaming the boundary would paint the frame and then remove it, which is why the empty case is worth re-checking if this page ever becomes dynamic.

---

## 4. Frontend Design

### 4.1 Composition

- `app/page.tsx` composes section components in order and holds no logic.
- Section components own their own data access and are individually replaceable.
- `components/ui/*` holds primitives shared across sections: `Button`, `Card`, `Badge`, `Container`, `SectionHeading`.
- `lib/api/properties.ts` is the only module that knows the API base URL and response shape.

### 4.2 Static content modules

Every static section reads from a typed module in `content/`, never from markup. Promoting a section to dynamic later means replacing that import with a fetch, without touching the component.

| Module | Feeds |
| --- | --- |
| `content/navigation.ts` | The header and the mobile drawer |
| `content/hero.ts` | The hero image, the search panel, and the welcome block |
| `content/featured-properties.ts` | The words around the dynamic section, not the properties |
| `content/venues.ts` | The Culinary Journey and Wellness Harmony Escape, one shape for both |
| `content/membership.ts` | The WeInivie panel |
| `content/story.ts` | Our Story, four chapters over the eight mantras |
| `content/offers.ts` | Our Special Offers |
| `content/journal.ts` | What's New |
| `content/featured-in.ts` | The media row |
| `content/faq.ts` | The accordion |
| `content/footer.ts` | The footer |

The two most likely next candidates for the CMS are `journal.ts` and `offers.ts`, which is why both are shaped as arrays of a named record rather than as a bag of strings.

`content/actions.test.ts` is the one test that reads across all of them. Brief ch. 4A asks that every control name its destination and that no label appear twice, and that is a property of the page rather than of any section, so it cannot be checked from inside one.

### 4.3 Images

`next/image` everywhere, with per breakpoint `sizes` so mobile never downloads desktop assets. The hero image carries `priority`; every other image is lazy.

The media host is allowlisted in `next.config.ts` under `images.remotePatterns`, built from `NEXT_PUBLIC_MEDIA_HOST` rather than written as a literal. This keeps the frontend half of the storage seam in ch. 5.5 honest: `next/image` refuses to load a host that is not allowlisted, so a hardcoded pattern would turn a one-line storage change into every property image silently failing to render.

`next/image` also does the work a transformation CDN would otherwise be bought for, converting to modern formats and emitting per breakpoint sizes on demand. That is why the local disk choice costs the homepage nothing in image quality or weight.

**Where the two sets of imagery come from, and why they differ.** Property images belong to the CMS and are seeded from the eight drawn WebP files committed beside the seeder, for the licensing and reproducibility reasons in DATA-MODEL ch. 4. The static sections are not seeded and are not the CMS's business: their photography under `web/public/home/` is the client's own, taken from the live site at the repository owner's instruction, because these eleven sections are a redesign of that site's own pages and placeholder scenery would have made the visual result untestable.

The two rules DATA-MODEL ch. 4 gives still hold where they apply. Nothing here is licensed stock pulled from a third party, and nothing in the CMS changed. What is no longer true for `web/` is reproducibility from the repository alone: these files can be recovered from the group's own sites, not regenerated from a script. That is a real cost and it is recorded rather than hidden.

The restaurant and spa pictures come from `thewonderspace.com` and `svahawellness.com` rather than from `inivie.com`. Those are the group's own sub-brand sites, the ones the homepage links out to, and they are where each venue's own photograph lives. `docs/DESIGN-SYSTEM.md` ch. 6.10 governs how the pictures are used; where they came from is recorded here.

The eight media logos are third party marks, trimmed and downscaled from print resolution to the size the row actually renders. `content/featured-in.ts` says why a ninth is not among them.

---

## 5. CMS Implementation

### 5.1 Access and authentication

- URL: `http://localhost:8000/admin`
- Laravel session authentication with an email and password form, protected by the built in login rate limiter.
- A single role, admin. Demo credentials are documented in the README.
- Every admin route sits behind the `auth` middleware. Visiting an admin URL without a session redirects to the login page.

That property is asserted by walking the route table rather than by requesting one URL. Probing `/admin` proves only that `/admin` is locked; walking the table fails the suite when a route is added later outside the group. See `tests/Feature/Admin/AdminAccessTest.php`.

### 5.2 Routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/` | GET | Redirects to `/admin`. The CMS has no public web surface, so a reviewer opening `localhost:8000` arrives somewhere real |
| `/admin/login` | GET, POST | Login screen and submission |
| `/admin/logout` | POST | Sign out. POST rather than GET, so a prefetch or an image tag cannot end the session |
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
| `sort_order` | required, integer, min 0, max 65535 |
| `is_published` | boolean |

Validation failures return the user to the form with old input and per field error messages, satisfying capability C8 in PRD ch. 7.1. The one value a browser will not let a form repopulate is the file input, so a failure elsewhere costs the admin that field alone.

`slug` is required here and optional on the form, which is not a contradiction: the request derives it from the title in `prepareForValidation` before the rules run. Deriving it there rather than leaving it to `PropertyObserver` is what turns a collision into a per field message instead of a unique constraint violation the admin reads as a 500. The observer stays as the guarantee for the paths that never touch a form, such as the seeder and Tinker. See D4 in DATA-MODEL ch. 3.

The rules themselves live in an abstract `PropertyRequest`, with `StorePropertyRequest` and `UpdatePropertyRequest` supplying only the two that differ: whether an image is required, and whether the slug uniqueness check excludes the record being edited. Two copies of a twelve row table drift, and the copy that drifts is discovered as a card the API accepted and the homepage cannot render.

An unchecked checkbox is not submitted at all, so `is_published` is normalised in the same hook. Without it an update would keep the old value, and an admin who unpublished a property would be told it worked while the property stayed on the homepage.

The ceiling on `sort_order` is the column's, not a preference: DATA-MODEL ch. 1 declares it a `smallint unsigned`. It is named once as `Property::MAX_SORT_ORDER`, because both this form and the reorder batch in ch. 5.6 validate against it. Without it the write reaches MySQL and comes back either as a 500 or, on a server that is not in strict mode, as a value silently truncated to the maximum while the admin is told the save worked.

### 5.4 Image handling

- Uploads go to the `properties/` prefix on the configured disk, under hashed filenames.
- For this project the configured disk is `public`, served through the `php artisan storage:link` symlink.
- On update with a new image, the old file is deleted only once the record has saved and the surrounding transaction has committed, through `DB::afterCommit`. If the save fails or the transaction rolls back, the original file survives and the row still points at it. Deleting any earlier leaves a property pointing at a file that no longer exists, with nothing to restore it from.
- An upload lands before the row that will point at it, on both the create and the update path, because `image_path` is not nullable. If that write then throws, the upload is removed on the way out. Otherwise the disk accumulates files no row has ever pointed at, and nothing will ever collect them.
- Deleting a property is a soft delete, so its image is retained. Files are removed only on force delete.
- No server side resizing. Size optimisation is handled by `next/image`. The 2 MB cap and minimum dimensions already protect quality and storage.
- The seed images of DATA-MODEL ch. 4 are committed under `cms/database/seeders/images/` and copied onto the disk by the seeder, overwriting whatever is at the destination. Seeding is a reset to a known state: the seeder rewrites `image_path` back to the canonical path either way, so leaving a replaced file in place would only put the row and the disk out of step. They are not committed under `storage/` because that is state the application writes and a force delete is entitled to empty.

`PropertyImageStore` performs all of this, and decides none of it. Controllers never touch the filesystem directly.

*When* a file should go is a fact about the record rather than about the disk, so it lives in `PropertyObserver` alongside D4 and D6: the replaced file goes on `updated`, the file of a deleted property goes on `forceDeleted`, and neither is something a caller has to remember. A cleanup written into the controller would hold for the edit form and quietly not hold for the reorder screen, a bulk import, or a Tinker session, and the failure would surface months later as a disk full of files nobody can account for.

### 5.5 The storage seam

Local disk is the right choice for this test, not the right choice forever. Production inivie.com already serves media through a CDN (PRD ch. 2.2). So the storage location is treated as a configuration value from the start, and moving to object storage later must be a config change rather than a rewrite.

Three rules make that true. Each is cheap now and expensive to retrofit.

| Rule | Why it is the load-bearing one |
| --- | --- |
| **`image_path` stores a relative path, never a URL** | A stored URL bakes the host into every row. Changing storage would then need a data migration to rewrite them, and any row missed stays broken forever. A relative path is location independent, so the same rows work on any disk |
| **The absolute URL is derived once, in `Property::imageUrl()`, via `Storage::url()`** | Laravel's filesystem abstraction already knows how to build a URL for whichever disk is configured. One derivation point means one place to change, and consumers never learn where the bytes live. It sits on the model rather than in `PropertyResource` because the admin renders the same image in its index thumbnail and its edit preview, and a second derivation for the panel would be a second place to fix |
| **`PropertyImageStore` is the only code that touches storage** | A controller that reaches for the filesystem directly is a second seam nobody remembers to move. This covers the seeder too: it reaches the disk through `import()` rather than copying files itself, so a move to object storage does not leave `migrate --seed` writing to a directory nothing serves any more |

**Configuration.** The disk name and the frontend's media host are environment values, never literals in code.

| Variable | App | This project | After a move to object storage |
| --- | --- | --- | --- |
| `FILESYSTEM_DISK` | `cms/` | `public` | `s3` |
| `APP_URL` | `cms/` | `http://localhost:8000` | unchanged |
| `NEXT_PUBLIC_MEDIA_HOST` | `web/` | `localhost:8000` | the CDN or bucket host |

`next.config.ts` builds `images.remotePatterns` from `NEXT_PUBLIC_MEDIA_HOST` rather than hardcoding a host. A hardcoded pattern is the failure that turns a one-line storage change into every image on the homepage silently failing to render, because `next/image` refuses hosts that are not allowlisted.

**What the move would then cost:** set `FILESYSTEM_DISK=s3`, add the bucket credentials, point `NEXT_PUBLIC_MEDIA_HOST` at the CDN. No migration, no code change, no touched rows.

### 5.6 Reordering

The index page allows editing the order column inline. Submission sends a position for every row the page is showing, as `order[{id}] = {position}`, and the batch is applied inside a database transaction, so a partial failure cannot leave a half reordered list.

The scope is the page rather than the whole table. With a pager in play, saving moves the rows the admin can see and leaves the rest where they were, and the footer bar says so in as many words once there is a second page to be confused with.

The batch is accepted or refused whole, and refusing it is validation's job before it is the transaction's. A position that is not a whole number, or is outside the column's range, comes back as a message at its own input. A position naming an id that no longer resolves comes back as one message about the list, because a table left open while a property was deleted elsewhere is not a database error: applying the part of the submission that still resolves would save a running order the admin never saw, and nothing downstream would notice.

`ReorderPropertiesRequest` resolves the whole set in one query rather than one per row, and checks the shape of each key before it reaches the database. The ids arrive as array *keys*, which `exists` cannot reach, so the check is an after hook rather than a rule.

**The form and the table are one document.** Each position input carries `form="reorder"` and belongs to the footer bar's form by id rather than by nesting. The rows also carry a publish form and a delete form, and a form cannot contain a form. Associating by id is what lets one submission gather a position from every row while each row keeps its own actions.

That is also why the stacked list below 640px relays the same cells rather than rendering the rows a second time. Two renderings would put two copies of every position input in the document under one name, and the copy the admin cannot see would be the one that wins.

The cost of belonging to a form the row does not contain is that a row action does not carry the positions with it. An admin who retypes three numbers and then hits Publish on a fourth row loses the three, because the publish form submits its own field and the redirect renders the table from the database again. That is the ordinary behaviour of unsaved input on a server rendered page, and it is the same for Edit, Delete and the pager, so it is left alone rather than papered over with a script that guesses when to interrupt. It is written down here because the `form` attribute makes the three inputs look like they are part of the page rather than part of one unsaved form.

---

## 6. Security Implementation

Implements requirements S1 to S5 in PRD ch. 8.5.

| Area | Implementation |
| --- | --- |
| Admin auth | Laravel sessions, bcrypt password hashing, login rate limiting |
| CSRF | Enabled on every admin form, including the delete and publish toggle actions |
| Uploads | Mime and size validation, hashed filenames, stored under `storage/` rather than in the code directory |
| Public API | Read only. Mutation routes are never registered under `/api/v1`, asserted against the route table by a feature test rather than by probing one URL. Rate limited to 60 requests per minute per IP through the `api` limiter defined in `AppServiceProvider` |
| CORS | Only the frontend origin is allowed, taken from `FRONTEND_URL` in `cms/.env`, never a wildcard. `config/cors.php` also narrows the paths to `api/*` and the methods to `GET, HEAD, OPTIONS`. Mirrors production, which sends `Access-Control-Allow-Origin: https://inivie.com` |
| Indexing | API responses send `X-Robots-Tag: noindex`, matching production |
| Secrets | All through `.env`, with a committed `.env.example` and `.env` in gitignore |
| Revalidation endpoint | Requires a shared secret, rejects with 401 on mismatch |
| Mass assignment | Explicit `$fillable` plus Form Requests. Never `Model::create($request->all())` |

---

## 7. Non-Functional Implementation

### 7.1 Meeting the performance targets

The targets are in PRD ch. 8.2. They are met by:

- Server Components for everything except the interactive widgets ch. 3.1 lists.
- ISR, so a visitor almost always hits a pre-rendered page.
- WebP images, sized per breakpoint. One image on the route is preloaded, the hero poster, and it is the only one at `quality={60}` rather than Next's default 75: it is never seen undimmed, sitting under the ink gradient of DESIGN-SYSTEM ch. 6.8, so the detail the extra fifteen points buys is painted over. That is 49KB down to 35KB on the one image fetched before anything else.
- The hero film requested only after the load event, and not at all on a connection reporting `saveData` or an `effectiveType` of 3g or below. The two cuts are 12MB and 16.5MB, and mounted at hydration they opened that request beside the property images and the fonts.
- Fonts loaded through `next/font/google` with `display: swap` and a latin subset, which removes both layout shift and any runtime third party request. Inter is preloaded and Poppins is not: nothing above the fold is set in the heading face, because the hero carries no type at all.
- `react-day-picker` split out of the route bundle. It is 32KB gzipped for a control most visits never open, so `DateRangeField` reaches it through `lazy` and `CalendarSkeleton` holds the panel's size until it lands.
- Skeletons dimensioned to match final content, which keeps layout shift near zero.

### 7.2 Meeting the SEO targets

Next.js Metadata API for title, description, Open Graph, and Twitter cards. One `h1` on the page, with section headings as `h2` and card titles as `h3`. `Organization` JSON-LD in the root layout, built from the content the footer already renders rather than restated, so the two cannot disagree. A canonical URL from an environment variable.

`robots.txt` is generated rather than static, which is a change from this chapter's first draft. The line in it that matters is the absolute URL of the sitemap, and an absolute URL cannot be written into a file in `public/` without hardcoding the host. So `SITE_URL` is read once in `web/src/lib/site.ts`, and the canonical, the Open Graph URLs, `robots.txt` and `sitemap.xml` all derive from it. A canonical pointing somewhere the sitemap does not is worse than either being absent: each one tells a crawler the other lied.

The sitemap lists one URL, because this project builds one route. The rest of inivie.com is production's and is not served from here (PRD ch. 3.2).

The social sharing image is `web/public/og-image.jpg`, 1200 by 630, cropped from the hero still. JPEG rather than the WebP it came from, because LinkedIn does not render WebP previews.

### 7.3 Meeting the accessibility targets

Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`). Alternative text is guaranteed non-empty because `image_alt` is a required CMS field, which is the reason it is modelled as `not null` rather than nullable. The FAQ accordion uses native `details` and `summary` so it is keyboard operable without custom JavaScript. The mobile drawer traps focus and closes on Escape. Contrast pairings are validated against the token table in DESIGN-SYSTEM ch. 2.

Three rules the first draft did not name, all three found by measurement rather than by reading the markup.

**Every landmark has a distinct name.** A named `<section>` is a region, and the hero was labelled "iNi ViE Hospitality" while the welcome block below it is labelled by an `h1` reading the same words. The hero's label is gone: the poster describes itself, the film is decorative, and the panel inside it is already a `form` landmark.

**An accessible name extends the visible label, it never replaces it.** Six property cards read "View property", and the title that told them apart was supplied as an `aria-label`, so the control said one thing and answered to another. That is SC 2.5.3, and it leaves anyone driving the page by voice naming a control that no longer responds. The title is now appended in `sr-only` text, and `Button` no longer accepts an `aria-label` at all, so the door that invited it is shut.

**A hit area is set, never inherited from a line height.** RS2 asks for 44 by 44 on mobile and SC 2.5.8 asks for 24 by 24 at every width. The footer's department desks stacked a number directly on an address at 18px a line, which failed both. Every link in the footer now carries one sizing rule.

---

### 7.4 What was measured, and what it said

Measured on 24 August 2026 against `next build && next start`, in Lighthouse 13.4.1 and axe-core 4, driven headless through Microsoft Edge. The CMS was running, so Featured Properties held its six real cards. Re-run these rather than trusting the table if anything in ch. 7.1 changes.

**Responsive.** No horizontal scroll at 320, 375, 390, 768, 1024, 1440 or 1920: `document.scrollWidth` equals `clientWidth` at every one, and no element's box crosses either edge. No console errors at any width. RS6's three widths are captured in `docs/screenshots/`.

RS4, per breakpoint image sizes, holds. A phone at 375 with a 2x screen is served nothing wider than the 750px variant; the 1920px one appears only at 768 with a 2x screen, which genuinely asks for 1536 device pixels, and at 1440. RS5 holds too: the longest title in the seed data, "Nusa Penida Guide: Beaches, Boat Times and Trip Costs in Bali", sets on two lines inside its two line clamp at all three widths, and every element reporting a horizontal overflow is `sr-only`, which is what `sr-only` is.

**Keyboard.** One walk from the top of the document to the end of the footer at 1440: 112 stops, beginning at the skip link and ending on the footer's policy link before focus leaves the page. Every stop draws an outline; none is focusable while invisible. The drawer of RS3 opens on Enter with focus on its close button, holds focus for twenty tabs without leaking, locks the page behind it, closes on Escape and hands focus back to the button that opened it.

**Reduced motion.** With the operating system setting emulated: no `<video>` element mounts, zero `.mp4` requests are made, the media ribbon reports `paused`, and every transition duration collapses to 0.00001s. Without it: the film mounts, one `.mp4` is fetched, the ribbon runs, transitions are 200ms.

**Accessibility.** axe-core across the WCAG 2.0 A and AA, 2.1 A and AA, 2.2 AA, best practice and experimental rule sets, at 375px and at 1440px.

| Rule | Before | After |
| --- | --- | --- |
| `color-contrast` | 6 to 7 nodes | 6 to 7 nodes, and every one is `on-accent` on `accent`: the named exception of PRD ch. 8.4, measured in DESIGN-SYSTEM ch. 2.2 at 2.98 |
| `label-content-name-mismatch` | 3 nodes | 0 |
| `landmark-unique` | 1 node | 0 |
| `target-size` | 9 nodes | 0 |
| every other rule | 0 | 0 |

`color-contrast-enhanced` reports 24 nodes and is not in scope: it is the AAA threshold of 7 to 1, and PRD ch. 8.4 targets AA.

One measured shortfall against RS2 is knowingly kept. In a carousel, the slides either side of the selected one are drawn at 94 per cent (DESIGN-SYSTEM ch. 6.7), which takes a 44px control to 41px on the two cards that are only partly on screen anyway. The selected card, the one a visitor is acting on, is a full 44. There is no scale below 1 that leaves the control at 44, so the choice is the focus treatment or the last three pixels of a preview.

**Performance.** Lighthouse mobile, on the local production build. Both throttling methods are recorded because they disagree, and the disagreement is the finding.

Targets are PRD ch. 8.2, as corrected there on 24 August 2026. That correction came out of this measurement: two of its rows were describing the wrong thing, and the paragraphs below are what showed it.

| | Target | Simulated, Lighthouse's default | Devtools throttling |
| --- | --- | --- | --- |
| Performance | at least 90 | **92** | **98** |
| Largest Contentful Paint | under 2.5s measured | 3.3s to 3.4s estimated | **1.8s** |
| Cumulative Layout Shift | under 0.1 | **0** | **0** |
| Total Blocking Time | under 200ms | **20ms** | **120ms** |
| Application JavaScript | under 50KB over the baseline | **45KB**, of 158KB in total | - |
| Accessibility | - | 96 | 96 |
| Best practices | - | 100 | 100 |
| SEO | - | 100 | 100 |

The performance score moves a point either way between runs, 91 to 93 over five; the figure above is the median. Everything else was stable.

**Largest Contentful Paint, and why two numbers.** Lighthouse's default is Lantern, which models what the page would have done on a 1.6Mbps link rather than putting it on one. Apply that same profile to the network for real and the number is 1.8s. Unthrottled it is 0.2s. Both are kept because the estimate is what a reviewer running `lighthouse` with no arguments is shown, and an unexplained 3.3s beside a 2.5s target reads as a failure that nothing here would explain.

Worth knowing either way: the element Chrome picks as largest is the header wordmark, not the hero photograph. Chrome will not accept an image covering the whole viewport as an LCP candidate, on the grounds that such an image is almost always a background, so the full bleed poster of PRD ch. 6.1 can never be this number whatever it costs. Verified by blocking the wordmark's request, after which the largest candidate falls to a 2,299 pixel span of text.

**The JavaScript budget, and why it is now two numbers.** 158KB in total. 113KB of that is React and the Next runtime, in two chunks that were checked for and contain no component of ours. The 45KB above it is the twelve client components ch. 3.1 lists, and it is the only part any decision here moves: splitting `react-day-picker` out took the route from 176KB to 158KB, and the only remaining candidate of that size is the carousel, which renders the cards, so deferring it would blank three sections of the page to save 13KB.

A single 150KB total, which is what ch. 8.2 asked for before any of this was measured, was a budget on the framework rather than on the application: it left 37KB for everything this project writes. Budgeting the 45KB instead is the number that can actually be spent or saved.

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
│   ├── .env.example           defaults to the Compose path; two lines differ
│   │                          natively, see ch. 2.4
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Admin/PropertyController.php
│   │   │   │   ├── Admin/ReorderPropertiesController.php
│   │   │   │   ├── Admin/PublishPropertyController.php
│   │   │   │   ├── Auth/LoginController.php
│   │   │   │   ├── Api/V1/PropertyController.php
│   │   │   │   └── Api/V1/HealthController.php
│   │   │   ├── Middleware/ApiResponseHeaders.php
│   │   │   ├── Requests/PropertyRequest.php      the shared rules table
│   │   │   ├── Requests/StorePropertyRequest.php
│   │   │   ├── Requests/UpdatePropertyRequest.php
│   │   │   ├── Requests/Api/V1/ListPropertiesRequest.php
│   │   │   └── Resources/PropertyResource.php
│   │   ├── Enums/PropertyCategory.php
│   │   ├── Models/Property.php
│   │   ├── Observers/PropertyObserver.php
│   │   └── Services/
│   │       ├── PropertyImageStore.php     stores, imports and removes files
│   │       └── FrontendRevalidator.php    calls the Next.js webhook
│   ├── config/cors.php        one origin from FRONTEND_URL, never a wildcard
│   ├── database/{migrations,factories,seeders}/
│   │   └── seeders/images/    the 6 seed pictures of DATA-MODEL ch. 4, and
│   │                          generate.py, the tool that drew them. Committed
│   │                          here rather than under storage/, which is state
│   │                          the application writes: see ch. 5.4
│   ├── resources/views/{layouts,admin,auth,components}/
│   │                          components/ holds the anonymous Blade
│   │                          components reused across admin screens
│   │                          (the form field, the status badge)
│   ├── routes/{web.php,api.php}
│   └── tests/{Feature,Unit,Support}/
└── web/                       Next.js application
    ├── .env.example
    ├── AGENTS.md              Next's own agent rules, regenerated by `next dev`
    ├── CLAUDE.md              one-line pointer to it
    ├── eslint.config.mjs
    ├── vitest.config.mts
    ├── vitest.setup.ts
    ├── src/
    │   ├── app/
    │   │   ├── globals.css    the design tokens, single source for the palette
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── robots.ts      both generated rather than static, so the host
    │   │   ├── sitemap.ts     in them is the one the canonical uses: ch. 7.2
    │   │   └── api/revalidate/route.ts
    │   ├── components/
    │   │   ├── layout/{Header,MobileDrawer,NavDropdown,Footer}.tsx
    │   │   ├── property/{PropertyCard,PropertyCardSkeleton}.tsx
    │   │   │                  the pieces of the dynamic section, kept apart
    │   │   │                  from sections/ because the skeleton and the real
    │   │   │                  cards have to share one grid
    │   │   ├── search/{SearchDock,DestinationField,DateRangeField,GuestsField}.tsx
    │   │   ├── sections/{Hero,FeaturedProperties,Culinary,...}.tsx
    │   │   ├── venue/VenueCard.tsx
    │   │   └── ui/{Button,Card,Badge,Container,SectionHeading,...}.tsx
    │   ├── content/           typed static content, and site.ts, the words
    │   │                      the metadata and the structured data share
    │   ├── design/            contrast maths, token parsing, palette checks
    │   ├── lib/
    │   │   ├── api/properties.ts
    │   │   ├── site.ts        the one origin every absolute URL derives from
    │   │   └── organization.ts  Organization JSON-LD, read off the footer
    │   └── types/property.ts
    ├── e2e/
    └── public/
        ├── og-image.jpg       1200 by 630, the social sharing card
        └── home/              the section imagery, and the hero film

`web/` has no `.gitignore` of its own. The root file covers both applications,
and a nested one would shadow it: `create-next-app` ships `.env*`, which in
`web/` overrides the root's `!.env.example` and would quietly drop a file the
setup instructions tell a reviewer to copy.
```

Naming principles: components in PascalCase, folders in kebab-case, one component per file, and no `utils.ts` dumping ground.

`Api/V1/` nests, in requests as well as controllers, while the admin form requests stay flat. The version is part of the public contract (P1), so everything the contract is made of moves together when `/api/v2` arrives. An admin form request has no version to move with.

---

## 9. Testing Strategy

### 9.1 Automated tests

| Layer | Tooling | Minimum coverage |
| --- | --- | --- |
| Laravel feature | Pest | The public endpoint returns only published properties in the correct order, `limit` and `category` are validated, admin CRUD works end to end, the publish toggle moves a property on and off the public endpoint without rewriting its first `published_at`, a reorder is applied whole or not at all, guests are rejected from admin routes, validation rules hold, and the old file is deleted on image update |
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
