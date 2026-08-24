# Frontend - iNi ViE Hospitality Homepage Redesign

Next.js 16 on the App Router, with TypeScript and Tailwind CSS 4. The redesigned homepage: eleven sections of typed static content, plus Featured Properties, which reads the Laravel API in [`../cms`](../cms).

Runs on http://localhost:3000. Node 24, no Docker.

**Setup is in the [root README](../README.md#setup)**, which covers both applications at once, along with the checks and the production build the measurements are taken against. There are deliberately no commands here: two setup lists that disagree is a defect this repository has already removed once, and the reasoning is in [`../docs/TECHNICAL-DESIGN.md`](../docs/TECHNICAL-DESIGN.md) ch. 2.4.

`src/types/property.ts` and `../cms/app/Http/Resources/PropertyResource.php` describe the same payload. They change in the same commit.

| Topic                                                        | Document                                                                     |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Colour, typography, spacing, motion, breakpoints, components | [`../docs/DESIGN-SYSTEM.md`](../docs/DESIGN-SYSTEM.md)                       |
| Endpoint contract, caching, revalidation, failure behaviour  | [`../docs/API-SPEC.md`](../docs/API-SPEC.md)                                 |
| Rendering and caching, frontend composition                  | [`../docs/TECHNICAL-DESIGN.md`](../docs/TECHNICAL-DESIGN.md) ch. 3 and ch. 4 |
| What was measured, and how the targets are met               | [`../docs/TECHNICAL-DESIGN.md`](../docs/TECHNICAL-DESIGN.md) ch. 7           |

`AGENTS.md` here is generated: `next dev` rewrites its rules block on every run.
