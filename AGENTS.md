# AGENTS.md

Homepage redesign for inivie.com, built as a technical test. Two applications in one repository: `cms/` (Laravel, the CMS and REST API) and `web/` (Next.js, the frontend).

**Current state: `cms/` is built, `web/` is still a scaffold.** `cms/` has the properties table, model, factory and seeder, the public `/api/v1/properties` and `/api/v1/health`, and the admin panel in full: session authentication, the dashboard, property CRUD with image replacement and cleanup, the publish toggle, and inline reordering, under a Pest suite that covers every line of `cms/app`. What is left there is real seed imagery (#27). `web/` has the Next.js scaffold, the design system foundation, and `src/types/property.ts` mirroring the API payload. The layout shell, the homepage sections, and the wiring to the API are not built, and neither is the revalidation that connects the two applications (#16).

## Find the document that owns the topic

Five specification documents in `docs/`, each with one subject. Edit the owner, not whichever file you happen to have open.

| Document | Owns | Status |
| --- | --- | --- |
| `docs/PRD.md` | Problem, goals, scope, requirements, acceptance criteria, plan | **Frozen** |
| `docs/TECHNICAL-DESIGN.md` | Architecture, stack versions, CMS implementation, repo structure, security, testing | Living |
| `docs/DATA-MODEL.md` | Schema, indexes, domain rules, seed data | Living |
| `docs/API-SPEC.md` | Endpoint contract, payloads, caching, failure behaviour | Living |
| `docs/DESIGN-SYSTEM.md` | Colour, type, spacing, motion, breakpoints, component visuals | Living |

**Frozen** means the PRD records an agreed decision. Changing scope or a requirement there needs the user's say-so. The living documents change freely as implementation teaches you things.

Requirements carry stable ids used across all five documents and in commit messages: `R1-R8` (brief requirements), `G1-G6` (goals), `C1-C8` (CMS capabilities), `F1-F5` (Featured Properties behaviour), `D1-D7` (domain rules), `RS1-RS6` (responsive), `S1-S5` (security), `A1-A16` (acceptance criteria). Cite the id rather than restating the rule.

## Keep the contract atomic

`PropertyResource` (Laravel) and `types/property.ts` (Next.js) describe the same payload. **They change in the same commit, in one PR that touches both applications.** Splitting them across PRs is what lets an API and its consumer drift apart silently, which is the exact production defect this project was designed to avoid (`docs/PRD.md` ch. 2.3).

`docs/API-SPEC.md` is the authority on that payload. Update it in the same commit too.

## Branch, then PR

Work on a feature branch and open a PR against `main`. A git hook blocks pushes to `main`, so this is the only path that works.

```
git switch -c feat/whatever
# commit
git push -u origin feat/whatever
gh pr create --base main
```

The user merges. Commit messages carry no agent co-author line.

## Two applications, two toolchains

This is one repository holding two apps, not a monorepo. There are no workspaces, no root `package.json`, and no shared package.

| | `cms/` | `web/` |
| --- | --- | --- |
| Manager | Composer | npm |
| Runs in | Docker, with MySQL | Natively |
| Port | 8000 | 3000 |

**PHP and MySQL live in Docker, Node does not.** `cms/docker-compose.yml` is the only Docker in the repo, and application code stays unaware of it: no container hostnames in `config/`, no environment-specific helpers. Deleting the compose file must leave a working Laravel application, because a reviewer with PHP already installed skips Docker entirely. `docs/TECHNICAL-DESIGN.md` ch. 2.4 has the reasoning and the rules that keep both setup paths working.

Quality gates run once per application. Both must be green before the final commit of a PR.

## Conventions

- **Documentation is English**, including commit messages and PR bodies, matching the product's own language. Conversation with the user is Indonesian.
- **Plain dash `-`, never an em dash.** One exception, and only one: `web/AGENTS.md` is generated. `next dev` rewrites its rules block on every run, so its em dashes are left alone instead of being re-fixed in every diff.
- **Version numbers carry a verification date.** `docs/TECHNICAL-DESIGN.md` ch. 2.1 records when each version was last checked against primary sources. Bumping a version means re-checking against the npm registry, Packagist, and endoflife.date, then updating that date. Two versions in the first draft were already out of support because they were written from memory.
- **The brief PDF stays local.** `docs/*.pdf` is gitignored deliberately: it is the client's document, not project output.

## Agent skills

### Issue tracker

GitHub Issues on `RacThug/inivie-homepage-redesign`, driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name, sitting alongside the `cms` / `web` / `full-stack` area labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and one `docs/adr/` at the repo root, above the five specification documents. See `docs/agents/domain.md`.
