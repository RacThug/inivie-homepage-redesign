# Data Model - iNi ViE Hospitality Homepage Redesign

| Field | Value |
| --- | --- |
| Document type | Data Model Specification |
| Version | 1.1 |
| Date | 22 August 2026 |
| Database | MySQL 8.4 LTS |
| Status | Living document. Expected to change during implementation |

**Scope of this document.** The database schema, indexes, domain rules, and seed data. It is the source of truth for anything persisted.

Related: [PRD.md](./PRD.md) for the requirements this serves, [API-SPEC.md](./API-SPEC.md) for how these fields are exposed, [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md) for storage and validation mechanics.

---

## 1. Overview

The scope needs only one domain table beyond Laravel's defaults.

```
┌──────────────────────┐
│ users                │   stock Laravel schema, unchanged
│ ─────────────────────│   one admin account created by seeder
│ id, name, email,     │
│ password, timestamps │
└──────────────────────┘

┌────────────────────────────────────────────┐
│ properties                                 │   the dynamic section's content
│ ───────────────────────────────────────────│
│ identity     id, title, slug               │
│ taxonomy     category                      │
│ display      location, excerpt             │
│ media        image_path, image_alt         │
│ commercial   price_from, currency, rating  │
│ linking      cta_url                       │
│ publishing   sort_order, is_published,     │
│              published_at                  │
│ lifecycle    created_at, updated_at,       │
│              deleted_at                    │
└────────────────────────────────────────────┘
```

There is intentionally no relation between `users` and `properties`. Attributing content to an author would imply an editorial workflow that PRD ch. 3.2 explicitly excludes.

---

## 2. Table: `properties`

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `id` | `bigint unsigned` | PK, auto increment | |
| `title` | `varchar(120)` | not null | Property name, e.g. "Leedon Villa Seminyak" |
| `slug` | `varchar(140)` | not null, unique | Generated from the title, manually editable |
| `category` | `enum` | not null, default `villa` | `resort`, `villa`, `hotel` |
| `location` | `varchar(120)` | not null | e.g. "Seminyak, Bali" |
| `excerpt` | `varchar(240)` | not null | Short description shown on the card |
| `image_path` | `varchar(255)` | not null | Relative path on the `public` disk |
| `image_alt` | `varchar(160)` | **not null** | Required, not nullable, so alternative text can never be missing |
| `price_from` | `int unsigned` | nullable | Starting nightly rate in whole currency units |
| `currency` | `char(3)` | not null, default `IDR` | ISO 4217 code |
| `rating` | `decimal(2,1)` | nullable | Range 0.0 to 5.0 |
| `cta_url` | `varchar(255)` | nullable | Destination of the card button |
| `sort_order` | `smallint unsigned` | not null, default 0 | Ascending display order |
| `is_published` | `boolean` | not null, default false | Only true rows reach the homepage |
| `published_at` | `timestamp` | nullable | Set when first published |
| `created_at` | `timestamp` | | |
| `updated_at` | `timestamp` | | |
| `deleted_at` | `timestamp` | nullable | Soft delete marker |

### 2.1 Column notes worth defending in review

| Column | Decision | Why |
| --- | --- | --- |
| `image_alt` | `not null` rather than nullable | Accessibility is a stated requirement (PRD ch. 8.4). Making it nullable would let an editor ship an inaccessible card. The constraint enforces the requirement at the lowest possible layer |
| `price_from` | `int unsigned`, not `decimal` | Indonesian Rupiah has no minor unit in practical use. Integers avoid floating point formatting bugs entirely |
| `currency` | Stored per row, not hardcoded | Costs one column now and avoids a migration if a property is ever priced in another currency. Not multi-currency support, just not painting into a corner |
| `rating` | `decimal(2,1)`, nullable | Ratings are displayed to one decimal. Nullable because a newly listed property genuinely has no rating, which is different from a rating of zero |
| `sort_order` | `smallint unsigned` | An explicit ordering column, because insertion order is not an editorial decision |
| `slug` | Present despite there being no detail page | Costs nothing now, and is the prerequisite for the property detail page in PRD ch. 12. Also gives every row a stable human readable identifier |
| `deleted_at` | Soft delete | An accidental deletion in a CMS should be recoverable. Also lets image cleanup be deferred safely |

### 2.2 Indexes

| Index | Columns | Purpose |
| --- | --- | --- |
| Primary | `id` | |
| Unique | `slug` | Enforces D4 |
| Composite | `is_published`, `sort_order` | Serves the homepage query directly, which filters on the first and orders by the second |
| Single | `deleted_at` | Keeps the soft delete scope cheap |

The composite index order matters: `is_published` is the equality predicate and must come first, `sort_order` supplies the ordering. Reversing them would leave MySQL sorting a filtered set by hand.

---

## 3. Domain Rules

| ID | Rule | Enforced where |
| --- | --- | --- |
| D1 | The homepage only shows properties where `is_published = true` and `deleted_at is null` | Model scope, covered by a feature test |
| D2 | Display order is `sort_order` ascending, then `created_at` descending as a tiebreaker | Model scope |
| D3 | The homepage shows at most 6 cards. The default is 3 | API query parameter validation, see API-SPEC ch. 3 |
| D4 | `slug` is unique across all properties including soft deleted rows, to prevent collisions on restore | Database unique constraint plus a validation rule |
| D5 | Deleting a property is a soft delete. Image files are removed only on force delete | `PropertyImageStore` |
| D6 | `published_at` is set automatically when `is_published` transitions from false to true, and is never reset on unpublish | Model observer, covered by a unit test |
| D7 | When `price_from` is null the card omits the price row entirely rather than rendering a zero | Frontend component, covered by a component test |

### 3.1 Note on D6

`published_at` records when a property first went live, so it is a historical fact, not a mirror of current state. Resetting it on unpublish would destroy that fact and make "how long has this been featured" unanswerable. Current visibility is what `is_published` is for. Keeping the two separate is the reason both columns exist.

---

## 4. Seed Data

The seeder creates 6 properties: **4 published and 2 draft**.

| # | Title | Category | Published |
| --- | --- | --- | --- |
| 1 | Leedon Villa Seminyak | villa | yes |
| 2 | Ajowa Resort | resort | yes |
| 3 | La Mewali Resort | resort | yes |
| 4 | Astera Canggu | hotel | yes |
| 5 | Seascape Sanur | resort | no (draft) |
| 6 | Svaha Retreat Ubud | villa | no (draft) |

Names reflect properties genuinely associated with the group, taken from the live site, so the homepage looks credible rather than filled with lorem ipsum. Placeholder images are freely licensed WebP files committed to the repository, so `migrate --seed` produces a populated homepage with no external downloads.

**Why include drafts.** Two unpublished rows are not padding. They are the evidence that D1 works: a reviewer can see 6 rows in the CMS and exactly 4 on the homepage, which proves the publish filter is real rather than assumed.

A factory backs the seeder and is reused in tests, so test data and seed data cannot drift apart.

---

## 5. Migrations

One migration creates the table. Conventions:

- Column order follows the grouping in chapter 1, so the migration reads as a description of the domain rather than an arbitrary list.
- Indexes are declared in the same migration as the table.
- Enum values live in a PHP backed enum, referenced by both the migration and the model, so the allowed set is defined exactly once.
- No raw SQL. Nothing here needs it.
