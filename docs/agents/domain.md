# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This is a **single-context** repo. One `CONTEXT.md` and one `docs/adr/` at the root cover both applications: `cms/` and `web/` are two toolchains serving one domain, not two bounded contexts.

## Before exploring, read these

- **`AGENTS.md`** at the repo root - conventions, and the table that says which specification document owns which topic.
- **`CONTEXT.md`** at the repo root, if it exists.
- **`docs/adr/`** - read ADRs that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## The specification documents are the domain authority

This repo already carries five specification documents. Each owns one subject, and the owner is the file you read and the file you edit:

| Document | Owns | Status |
| --- | --- | --- |
| `docs/PRD.md` | Problem, goals, scope, requirements, acceptance criteria, plan | **Frozen** |
| `docs/TECHNICAL-DESIGN.md` | Architecture, stack versions, CMS implementation, repo structure, security, testing | Living |
| `docs/DATA-MODEL.md` | Schema, indexes, domain rules, seed data | Living |
| `docs/API-SPEC.md` | Endpoint contract, payloads, caching, failure behaviour | Living |
| `docs/DESIGN-SYSTEM.md` | Colour, type, spacing, motion, breakpoints, component visuals | Living |

**Frozen** means the PRD records an agreed decision. Changing scope or a requirement there needs the user's say-so - surface the conflict, don't edit around it.

`CONTEXT.md` and `docs/adr/` do not replace these. They hold vocabulary and decisions that no specification document owns.

## File structure

```
/
├── AGENTS.md
├── CONTEXT.md
├── docs/
│   ├── adr/
│   │   └── 0001-example-decision.md
│   ├── PRD.md
│   ├── TECHNICAL-DESIGN.md
│   ├── DATA-MODEL.md
│   ├── API-SPEC.md
│   └── DESIGN-SYSTEM.md
├── cms/
└── web/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`, and the requirement ids (`R1-R8`, `G1-G6`, `C1-C8`, `F1-F5`, `D1-D7`, `RS1-RS6`, `S1-S5`, `A1-A16`) as defined in the specification documents. Don't drift to synonyms the glossary explicitly avoids, and don't restate a rule you could cite by id.

If the concept you need isn't in the glossary yet, that's a signal - either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, or a frozen requirement in `docs/PRD.md`, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) - but worth reopening because..._
