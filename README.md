# iNi ViE Hospitality - Homepage Redesign

A redesign of the [inivie.com](https://inivie.com) homepage, built as a decoupled application: **Next.js** for the frontend and **Laravel** as the CMS and REST API, on **MySQL**.

Submitted as a technical test. Deadline 27 August 2026.

---

## Status

| Phase | State |
| --- | --- |
| Planning and specification | **Complete** |
| Laravel CMS and API | **Complete**: public API, admin panel, full CRUD |
| Next.js frontend | **Complete**: homepage, and the revalidation callback that closes the loop |

Remaining work is tracked as [GitHub issues](../../issues), one per pull request, ordered by dependency rather than by date. [docs/PRD.md](./docs/PRD.md) ch. 10 has the shape of that order.

---

## Tech stack

Option 2 from the brief.

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 |
| CMS and API | Laravel 13, PHP 8.5 |
| Database | MySQL 8.4 LTS |

**Why Option 2.** The live inivie.com is already a decoupled Next.js frontend served by a headless CMS. Option 2 mirrors that architecture, so this project effectively demonstrates replacing that CMS layer with a Laravel API behind a clean contract. The reasoning and the evidence behind it are in [docs/PRD.md](./docs/PRD.md) ch. 2.2.

---

## The dynamic section

The brief asks for one section other than the Hero to be driven by the CMS. This project uses **Featured Properties**, the "Featured property for you" section directly below the Hero.

It is fully managed through the CMS: create, edit, delete, reorder, and publish or unpublish, with image upload. The homepage renders it by calling the Laravel API. Six candidate sections were scored before choosing it; the matrix and the reasoning are in [docs/PRD.md](./docs/PRD.md) ch. 5.

---

## The homepage

Verified at the three widths RS6 names, on the production build with the CMS running. Full page captures are beside each one.

| Mobile, 375px | Tablet, 768px | Desktop, 1440px |
| --- | --- | --- |
| [![The homepage at 375px](./docs/screenshots/fold-375.jpg)](./docs/screenshots/home-375.jpg) | [![The homepage at 768px](./docs/screenshots/fold-768.jpg)](./docs/screenshots/home-768.jpg) | [![The homepage at 1440px](./docs/screenshots/fold-1440.jpg)](./docs/screenshots/home-1440.jpg) |

Below 1024px the navigation is a drawer, which traps focus, closes on Escape, and hands focus back to the button that opened it.

<img alt="The navigation drawer at 375px" src="./docs/screenshots/drawer-375.jpg" width="280">

### What was measured

Lighthouse 13 and axe-core, against `next build && next start` on 24 August 2026. The full record, including what the two misses are and why neither is fixed by different code, is in [docs/TECHNICAL-DESIGN.md](./docs/TECHNICAL-DESIGN.md) ch. 7.4.

| | Target | Measured |
| --- | --- | --- |
| Lighthouse Performance, mobile | at least 90 | **92**, moving a point either way between runs |
| Lighthouse Accessibility | - | **96** |
| Lighthouse Best practices | - | **100** |
| Lighthouse SEO | - | **100** |
| Largest Contentful Paint | under 2.5s measured | **1.8s** measured, 3.3s on Lighthouse's estimate |
| Cumulative Layout Shift | under 0.1 | **0** |
| Total Blocking Time | under 200ms | **20ms** |
| Application JavaScript, gzipped | under 50KB over the framework | **45KB**, of 158KB in total |
| Horizontal scroll from 320px | none | **none**, at seven widths |
| axe serious violations | none, bar one named exception | **one**, and it is the exception |

Two of those targets read differently here than they did when they were written. Measuring the page showed both describing the wrong thing - a paint time that depends on whether Lighthouse measures or estimates, and a byte budget that was really a budget on React - so [docs/PRD.md](./docs/PRD.md) ch. 8.2 carries a dated correction for each.

The axe violation is white text on the brand orange, 2.98 to 1 against AA's 4.5. It is what inivie.com itself ships on its own Search button, and no text colour rescues that fill: the alternatives were built and measured before the deviation was accepted. It is recorded as a **named exception** rather than a relaxed rule, so the next contrast failure still fails. [docs/DESIGN-SYSTEM.md](./docs/DESIGN-SYSTEM.md) ch. 2.2 has the numbers, [docs/PRD.md](./docs/PRD.md) ch. 8.4 the decision.

---

## Documentation

| Document | Contents |
| --- | --- |
| [docs/PRD.md](./docs/PRD.md) | Problem, goals, scope, the dynamic section decision, functional requirements, acceptance criteria, plan, risks |
| [docs/TECHNICAL-DESIGN.md](./docs/TECHNICAL-DESIGN.md) | Architecture, stack decisions, CMS implementation, repository structure, security, testing strategy |
| [docs/DATA-MODEL.md](./docs/DATA-MODEL.md) | Database schema, indexes, domain rules, seed data |
| [docs/API-SPEC.md](./docs/API-SPEC.md) | Endpoint contract, payloads, caching, revalidation, failure behaviour |
| [docs/DESIGN-SYSTEM.md](./docs/DESIGN-SYSTEM.md) | Colour, typography, spacing, motion, breakpoints, component visual specs |

The PRD is the frozen agreement on what is being built. The other four are living documents that change as implementation proceeds.

The original brief PDF is deliberately not committed. It is the client's document rather than project output, and is excluded in `.gitignore`.

---

## Setup

Two applications, started separately, and both blocks below were run from a genuinely fresh clone on 24 August 2026, top to bottom. Every line in them is here because it was needed, and what each run produced is recorded at the end of this chapter.

Start with the CMS. The frontend calls it while rendering, and a homepage built against an API that is not answering comes up without its properties rather than refusing to come up at all.

### The CMS

```bash
cd cms
cp .env.example .env              # nothing else creates it, see below
docker compose up -d --build      # PHP 8.5 and MySQL 8.4
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan storage:link

npm install && npm run build      # on your machine, not in the container
```

**The first line is the one a fresh clone cannot do without.** `.env` is gitignored, which is how requirement S4 keeps credentials out of version control, so only `.env.example` is committed and a clone arrives with no environment file at all. Nothing else in the block creates one. `key:generate` writes the key **into** `.env`, it does not create the file, and with no file to write into it stops the setup dead with `file_get_contents(/app/.env): Failed to open stream` and a non-zero exit. Copy it before `docker compose up` rather than after, so that the credentials MySQL initialises its volume with are the ones in the file.

**That last pair is not optional, and skipping it fails quietly.** Laravel compiles its own CSS and JS with Vite, `cms/public/build/` is gitignored, and the container carries PHP but no Node. Without it the API still answers correctly and `/admin` still returns 200, serving unstyled HTML. The reasoning is in [docs/TECHNICAL-DESIGN.md](./docs/TECHNICAL-DESIGN.md) ch. 2.4.

**`storage:link` is not optional either.** `cms/public/storage` is gitignored, so a fresh clone has no symlink and the `public` disk is not reachable over HTTP. Skipping that line leaves every seeded picture a 403 with its alt text showing, in the CMS and on the homepage alike.

**An edit in the CMS reaches the homepage straight away**, rather than after the 60 second cache window, because Laravel posts a cache invalidation callback to the frontend. That needs the same `REVALIDATE_SECRET` in `cms/.env` and in `web/.env.local`. Both `.env.example` files ship it empty, because a value published in a public repository is not a secret and requirement S4 says none may be in version control: pick any string, put the same one in both files, and restart the two servers. Left empty, the callback stays off and the homepage catches up on its own within a minute, which is the only thing that changes. [docs/API-SPEC.md](./docs/API-SPEC.md) ch. 5.2 has the contract.

The eight seeded properties come with their pictures. They are drawings committed at `cms/database/seeders/images/`, not photographs: this repository is public, and the photography on the live site is licensed stock that may not be redistributed. `migrate --seed` copies them onto the storage disk, so there is nothing to download. [docs/DATA-MODEL.md](./docs/DATA-MODEL.md) ch. 4 has the reasoning.

#### Using your own PHP and MySQL

Skip Docker entirely. Two of the things the block above relies on were never commands in it, they were Compose: creating the database with its user, and running the server. Both are yours here, on top of the two addresses in `.env`.

So, once, in your MySQL:

```sql
CREATE DATABASE inivie;
CREATE USER 'inivie'@'localhost' IDENTIFIED BY 'secret';
GRANT ALL PRIVILEGES ON inivie.* TO 'inivie'@'localhost';
```

Those three values are `DB_DATABASE`, `DB_USERNAME` and `DB_PASSWORD` from `.env.example`. Change them there instead if you would rather not have a database called `inivie` on your machine.

Then copy the environment file and edit two addresses in it:

```bash
cd cms
cp .env.example .env
```

`DB_HOST` goes from `mysql` to `127.0.0.1`, and `FRONTEND_INTERNAL_URL` from `http://host.docker.internal:3000` to `http://localhost:3000`. Those two are the only addresses that differ between the paths: inside a container, the frontend running on your machine is not on localhost, and here it is. [docs/TECHNICAL-DESIGN.md](./docs/TECHNICAL-DESIGN.md) ch. 2.4 has the reasoning.

The rest is the Docker block with the prefix dropped, plus the server that Compose was starting:

```bash
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
npm install && npm run build

php artisan serve                 # http://localhost:8000, as the container did
```

**PHP on Windows arrives with its extensions switched off.** A fresh install has no `php.ini` at all: copy `php.ini-development` next to it as `php.ini`, then uncomment `extension_dir = "ext"` and the lines for `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo_mysql` and `zip`. Add `pdo_sqlite` as well if you intend to run the test suite, which uses SQLite in memory rather than your MySQL. Miss `pdo_mysql` and Laravel starts cleanly and dies on the first query; miss `pdo_sqlite` and all 192 tests fail with `could not find driver` while the site itself works perfectly. The container has all of them already, and that is the single biggest practical difference between the two paths.

**This path was run on 24 August 2026 and it works.** A fresh clone on Windows 11, against PHP 8.5.8 and MySQL 8.4.9 installed natively, no Docker involved: every command above, then 192 Pest tests and `vendor/bin/pint --test` green, and the same API, image and admin checks the Docker path gets. Nothing in the application had to change for it - the whole cost was the `php.ini` in the paragraph above. [docs/TECHNICAL-DESIGN.md](./docs/TECHNICAL-DESIGN.md) ch. 2.4 has the full record.

#### Looking at the database

`docker compose up -d` also starts **phpMyAdmin at http://localhost:8080**, signed in with the `inivie` / `secret` pair from `cms/.env`. It is a browser for the database and no part of the application: deleting it from `cms/docker-compose.yml`, or deleting that file outright, leaves Laravel working.

MySQL is published on `127.0.0.1:3306` as well, so any client will do. Set `FORWARD_PMA_PORT` or `FORWARD_DB_PORT` if either port is already taken on your machine.

`docker compose down` keeps the data. `docker compose down -v` deletes the volume with it, and the way back is `migrate --seed`.

#### Admin access

The panel is at **http://localhost:8000/admin**.

| Field | Value |
| --- | --- |
| Email | `admin@inivie.com` |
| Password | `password` |

A demo account on a local database, seeded by `AdminUserSeeder` and published here on purpose: a reviewer who cannot sign in cannot review the CMS. `php artisan db:seed` resets it to these values.

### The frontend

Node only, no Docker. `package.json` asks for Node 24, which is the current LTS line; the run below was on 24.13.0.

```bash
cd web
cp .env.example .env.local        # nothing else creates it, see below
npm install
npm run dev                       # http://localhost:3000
```

**The first line is the one a fresh clone cannot do without, and skipping it fails quietly.** `.env.*` is gitignored under the same requirement S4 as the CMS, so a clone arrives with `.env.example` and nothing else, and Next reads `.env.local`. Without it every command above still succeeds, the homepage still returns 200, and ten of the eleven sections still render: **Featured Properties comes up with its heading, its blurb and its View All link, and no cards under them.** The one thing that says why is a single line in the build output, `[api/properties] CMS_API_URL is not set, so there is no API to call`. That is the section degrading rather than taking the page down with it, which is requirement F5 and the right behaviour in production ([docs/API-SPEC.md](./docs/API-SPEC.md) ch. 6), and it is merciless during setup.

The copied file needs no editing. Its two addresses, `CMS_API_URL` and `NEXT_PUBLIC_MEDIA_HOST`, both point at `localhost:8000`, which is where the CMS block above leaves the API and the images. `SITE_URL` is the origin the canonical URL, the sharing card, `robots.txt` and `sitemap.xml` are all built from, and `http://localhost:3000` is correct until this is deployed somewhere. `REVALIDATE_SECRET` is the one to fill in, with the same string as `cms/.env`, per the note in the CMS block above.

**The measurements in [What was measured](#what-was-measured) are against the production build, not `npm run dev`.** Development mode compiles on demand and ships a development React, so it is the wrong thing to put a stopwatch on:

```bash
npm run build && npm start        # http://localhost:3000
```

The checks, should you want to run them:

```bash
npm run lint
npm run typecheck
npm test
npm run format:check
```

### What has been verified

Every path here has been run from a `git clone` into an empty directory, with no `.env`, no `vendor/`, no `node_modules/` and no build output, so that nothing already installed on the machine could stand in for a missing step.

| Path | State |
| --- | --- |
| CMS, with Docker | **Verified**, 24 August 2026 |
| CMS, with your own PHP and MySQL | **Verified**, 24 August 2026, on PHP 8.5.8 and MySQL 8.4.9 |
| Frontend | **Verified**, 24 August 2026, on Node 24.13.0 |

What the frontend run produced, in order:

| Step | Result |
| --- | --- |
| `npm install` | 472 packages in 16s, no vulnerabilities |
| `npm run build` | Compiled and typechecked, seven routes, the homepage prerendered with a 1 minute revalidate |
| `npm run dev` | Ready in 0.4s, `.env.local` picked up by name in its own output |
| The homepage, against the CMS | 200. Six property cards, the number Featured Properties asks for, of the seven published of eight seeded: the eighth is unpublished in the seed data on purpose, so the publish toggle has something to show |
| The pictures | `next/image` optimises them off the CMS through the storage symlink, `200 image/jpeg`, 2.7KB for a card at 256px |
| `robots.txt`, `sitemap.xml`, `POST /api/revalidate` | 200, 200, and 401 with no secret set, which is the documented refusal |
| `npm test` | 359 Vitest tests in 41 files, green |
| `npm run lint`, `npm run typecheck`, `npm run format:check` | Clean |
| The same build with no `.env.local` | 200, and Featured Properties with no cards. The failure the note above describes, reproduced rather than predicted |

Two of those rows were red the first time and are green because of it, both of them defects a reviewer would have met before anybody else did. `npm run format:check` failed on `next-env.d.ts`, a file Next writes itself, gitignores, and marks as not to be edited: it lands with CRLF endings from `next build` on Windows and Prettier wants LF, so the gate failed on a file nobody in this repository owns. It is in `web/.prettierignore` now. And `npm test` failed once, on the very first run of the suite and never again, in the test that opens the calendar: that grid is `lazy`-imported, so the first click on the date field was also the first time Vitest transformed `react-day-picker`, which took 1.4s warm and longer than the ten second wait on a cold clone with eight workers competing for the disk. The module is imported at the top of that test file now, which moves the cost into the file's import phase where no test timeout is running. A suite that fails once on the first run and passes forever after is worse than one that fails every time, and a reviewer's first `npm test` is exactly that run.

---

## Repository layout

```
.
├── docs/     specification, see the table above
├── cms/      Laravel application
└── web/      Next.js application
```

Full structure with file level detail is in [docs/TECHNICAL-DESIGN.md](./docs/TECHNICAL-DESIGN.md) ch. 8.
