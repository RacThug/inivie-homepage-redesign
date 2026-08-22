# iNi ViE Hospitality - Homepage Redesign

A redesign of the [inivie.com](https://inivie.com) homepage, built as a decoupled application: **Next.js** for the frontend and **Laravel** as the CMS and REST API, on **MySQL**.

Submitted as a technical test. Deadline 27 August 2026.

---

## Status

| Phase | State |
| --- | --- |
| Planning and specification | **Complete** |
| Laravel CMS and API | Scaffolded, feature work in progress |
| Next.js frontend | Not started |

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

Full setup instructions will be verified from a fresh clone before submission, which is acceptance criterion A15 in the PRD. What is already runnable:

```bash
cd cms
docker compose up -d --build      # PHP 8.5 and MySQL 8.4
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed

npm install && npm run build      # on your machine, not in the container
```

**That last pair is not optional, and skipping it fails quietly.** Laravel compiles its own CSS and JS with Vite, `cms/public/build/` is gitignored, and the container carries PHP but no Node. Without it the API still answers correctly and `/admin` still returns 200, serving unstyled HTML. The reasoning is in [docs/TECHNICAL-DESIGN.md](./docs/TECHNICAL-DESIGN.md) ch. 2.4.

Using your own PHP and MySQL instead of Docker? Change `DB_HOST` in `cms/.env` from `mysql` to `127.0.0.1`. That is the only line that differs between the two paths.

### Admin access

The panel is at **http://localhost:8000/admin**.

| Field | Value |
| --- | --- |
| Email | `admin@inivie.com` |
| Password | `password` |

A demo account on a local database, seeded by `AdminUserSeeder` and published here on purpose: a reviewer who cannot sign in cannot review the CMS. `php artisan db:seed` resets it to these values.

---

## Repository layout

```
.
├── docs/     specification, see the table above
├── cms/      Laravel application  (pending)
└── web/      Next.js application  (pending)
```

Full structure with file level detail is in [docs/TECHNICAL-DESIGN.md](./docs/TECHNICAL-DESIGN.md) ch. 8.
