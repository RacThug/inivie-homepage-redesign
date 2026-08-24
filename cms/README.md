# CMS - iNi ViE Hospitality Homepage Redesign

Laravel 13 on PHP 8.5, backed by MySQL 8.4. Two jobs: the admin panel where Featured Properties is managed, and the public REST API that the Next.js frontend in [`../web`](../web) reads.

| | |
| --- | --- |
| Admin panel | http://localhost:8000/admin |
| Public API | http://localhost:8000/api/v1/properties |

**Setup is in the [root README](../README.md#setup)**, which covers both applications at once, with Docker and without. There are deliberately no commands here: two setup lists that disagree is a defect this repository has already removed once, and the reasoning is in [`../docs/TECHNICAL-DESIGN.md`](../docs/TECHNICAL-DESIGN.md) ch. 2.4.

`app/Http/Resources/PropertyResource.php` and `../web/src/types/property.ts` describe the same payload. They change in the same commit.

| Topic | Document |
| --- | --- |
| Schema, indexes, domain rules, seed data | [`../docs/DATA-MODEL.md`](../docs/DATA-MODEL.md) |
| Endpoint contract, payloads, caching, failure behaviour | [`../docs/API-SPEC.md`](../docs/API-SPEC.md) |
| CMS implementation, image storage, reordering | [`../docs/TECHNICAL-DESIGN.md`](../docs/TECHNICAL-DESIGN.md) ch. 5 |
| Security | [`../docs/TECHNICAL-DESIGN.md`](../docs/TECHNICAL-DESIGN.md) ch. 6 |
