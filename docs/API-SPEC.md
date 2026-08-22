# API Specification - iNi ViE Hospitality Homepage Redesign

| Field | Value |
| --- | --- |
| Document type | API Contract Specification |
| Version | 1.0 |
| Date | 21 August 2026 |
| Base URL (local) | `http://localhost:8000` |
| API version | `v1` |
| Status | Living document. Expected to change during implementation |

**Scope of this document.** The contract between the Laravel CMS and the Next.js frontend. It is the single authority on endpoint shapes, payloads, status codes, caching, and failure behaviour.

Related: [DATA-MODEL.md](./DATA-MODEL.md) for the underlying schema, [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md) for the rendering and revalidation strategy, [PRD.md](./PRD.md) for the requirements this serves.

---

## 1. Principles

| # | Principle | Reason |
| --- | --- | --- |
| P1 | Version in the path. Every public endpoint lives under `/api/v1` | A breaking change ships as `/api/v2` rather than breaking a deployed frontend |
| P2 | Public endpoints are read only | Mutations belong to the session authenticated CMS. No mutation route is ever registered under `/api/v1` |
| P3 | Responses are always wrapped in an object, never a bare array | Adding `meta` later is then not a breaking change |
| P4 | Return only fields the consumer actually renders | Direct countermeasure to the production defect in PRD ch. 2.3, where a 37 KB payload was fetched to fill a card needing three fields |
| P5 | No hypermedia envelope, no embedded relations | Same reason as P4. `_links` and `_embedded` cost bytes and, as production shows, can fail silently |
| P6 | Absolute URLs for media | The frontend never assembles paths, and never learns where the bytes live. Moving from local disk to object storage or a CDN changes `image_url` and nothing else. See TECHNICAL-DESIGN ch. 5.5 |
| P7 | Timestamps in ISO 8601, UTC | Unambiguous across timezones |
| P8 | Every documented field is always present | A field is either always populated or explicitly nullable. Never conditionally absent |

---

## 2. Endpoint Index

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/properties` | none | List published properties for the homepage |
| `GET` | `/api/v1/health` | none | Health check, to make debugging easy for a reviewer |
| `POST` | `/api/revalidate` (on the frontend) | shared secret | Cache invalidation callback, documented in ch. 5.2 |

---

## 3. `GET /api/v1/properties`

Returns published properties, ordered for display.

### 3.1 Query parameters

| Name | Type | Required | Default | Validation |
| --- | --- | --- | --- | --- |
| `limit` | integer | no | `3` | between 1 and 12 |
| `category` | string | no | - | one of `resort`, `villa`, `hotel` |

The upper bound of 12 exists so a crafted request cannot turn a public endpoint into a full table dump.

Both parameters are optional, and omitting one is the only way to get its default. A parameter that is present is validated: `limit=`, `limit=1.5` and `category=` are all rejected rather than quietly read as absent, because a client that sends an empty value is doing something it did not mean to and should hear about it. Validation lives in `ListPropertiesRequest`, not in the controller.

### 3.2 Success response

`200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "title": "Leedon Villa Seminyak",
      "slug": "leedon-villa-seminyak",
      "category": "villa",
      "location": "Seminyak, Bali",
      "excerpt": "Private pool villa steps away from Seminyak beach.",
      "image_url": "http://localhost:8000/storage/properties/leedon.webp",
      "image_alt": "Private pool at Leedon Villa Seminyak at dusk",
      "price_from": 3500000,
      "currency": "IDR",
      "rating": 4.8,
      "cta_url": "https://inivie.com/leedon-villa-seminyak",
      "sort_order": 1
    }
  ],
  "meta": { "count": 3 }
}
```

### 3.3 Field reference

| Field | Type | Nullable | Source | Notes |
| --- | --- | --- | --- | --- |
| `id` | integer | no | `id` | |
| `title` | string | no | `title` | |
| `slug` | string | no | `slug` | Not used by the homepage yet. Included for the future detail page |
| `category` | string | no | `category` | One of `resort`, `villa`, `hotel` |
| `location` | string | no | `location` | |
| `excerpt` | string | no | `excerpt` | Max 240 characters, guaranteed by the schema |
| `image_url` | string | no | derived from `image_path` | Absolute URL |
| `image_alt` | string | no | `image_alt` | Never empty, guaranteed by a not-null column |
| `price_from` | integer | **yes** | `price_from` | Whole currency units. When null the card omits the price row entirely (rule D7) |
| `currency` | string | no | `currency` | ISO 4217 |
| `rating` | number | **yes** | `rating` | One decimal. When null the card omits the rating |
| `cta_url` | string | **yes** | `cta_url` | When null the card button renders inert rather than broken |
| `sort_order` | integer | no | `sort_order` | Exposed so ordering is auditable from the response |

Fields deliberately **not** exposed: `is_published`, `published_at`, `created_at`, `updated_at`, `deleted_at`, `image_path`. They are internal state the public homepage has no use for, and `is_published` in particular would be meaningless since unpublished rows never appear.

### 3.4 Ordering and filtering

Applied server side, per rules D1 and D2 in [DATA-MODEL.md](./DATA-MODEL.md):

1. Only `is_published = true` and not soft deleted.
2. Ordered by `sort_order` ascending.
3. Ties broken by `created_at` descending.
4. Truncated to `limit`.

The frontend never sorts or filters. If the order is wrong, the bug has exactly one place to live.

### 3.5 Empty result

An empty set is a `200` with an empty array, not a `404`.

```json
{ "data": [], "meta": { "count": 0 } }
```

Zero published properties is a valid state, not an error. The frontend hides the whole section in response (rule F4).

### 3.6 Error responses

| Status | When | Body |
| --- | --- | --- |
| `422` | Invalid `limit` or `category` | Laravel's default validation error format |
| `429` | More than 60 requests a minute from one IP | Laravel's default throttle response |
| `500` | Unhandled server error | Generic message. No stack trace outside local debug mode |

`422` example:

```json
{
  "message": "The limit field must not be greater than 12.",
  "errors": { "limit": ["The limit field must not be greater than 12."] }
}
```

The limit of 60 a minute per IP comes from [TECHNICAL-DESIGN.md](./TECHNICAL-DESIGN.md) ch. 6. Every response carries `X-RateLimit-Limit` and `X-RateLimit-Remaining` so a consumer can see where it stands before being refused.

---

## 4. `GET /api/v1/health`

`200 OK`

```json
{ "status": "ok", "database": "connected" }
```

`503 Service Unavailable`

```json
{ "status": "error", "database": "unreachable" }
```

The check is a `select 1` round trip rather than a look at the connection object, because an already opened connection reports itself as fine after the server behind it has gone away.

This endpoint exists purely so a reviewer diagnosing a blank section can tell in one request whether the CMS or the connection between apps is at fault.

**It is the one endpoint that is never cached.** It answers `Cache-Control: no-store` instead of the `max-age=60` of ch. 5.1. A health check served from a minute old cache reports the past, which is worse than not answering at all.

---

## 5. Caching and Revalidation

### 5.1 Response headers

| Header | Value | Applies to | Reason |
| --- | --- | --- | --- |
| `Cache-Control` | `max-age=60, public` | successful reads, health excepted | Content changes rarely. 60 seconds bounds staleness without a request storm |
| `X-Robots-Tag` | `noindex` | every response, errors included | API responses must not appear in search results. Matches production behaviour |
| `Access-Control-Allow-Origin` | `FRONTEND_URL` from `cms/.env` | every response | Never a wildcard. Matches production, which pins `https://inivie.com` |

Two details of the `Cache-Control` row are worth stating rather than discovering:

- **The directive order is `max-age=60, public`.** Symfony re-serialises the header with its directives sorted, so the value on the wire is not the order written here or anywhere else.
- **Only a successful read carries it.** A `422` or a `503` held in a shared cache for a minute would outlive the condition that produced it and go on answering somebody else's valid request.

`ApiResponseHeaders`, prepended to the `api` middleware group, sets both headers. Being prepended is what lets it reach the responses rendered from exceptions thrown further in, so a `422` from validation and a `429` from the rate limiter are covered by the `X-Robots-Tag` rule too.

CORS is the framework's `HandleCors` middleware reading `cms/config/cors.php`, which is narrowed from the framework defaults: `api/*` only, the read verbs only, and one origin taken from `FRONTEND_URL`. With a single allowed origin the header is echoed unconditionally, which is what makes the refusal work: a browser compares the value with its own origin and blocks the read when they differ.

### 5.2 On-demand revalidation

After a successful create, update, delete, reorder, or publish toggle, Laravel calls the frontend:

```
POST {NEXT_PUBLIC_SITE_URL}/api/revalidate
X-Revalidate-Secret: {REVALIDATE_SECRET}
Content-Type: application/json

{ "tag": "properties" }
```

| Status | Meaning |
| --- | --- |
| `200` | Cache tag dropped, next request re-renders |
| `401` | Secret missing or wrong |
| `400` | Unknown tag |

**Failure policy.** A non-200 response is logged and swallowed. It must never fail or roll back the CMS operation, because the 60 second time to live already guarantees eventual consistency. An editor should never see a save fail because the frontend was down.

---

## 6. Type Mirroring

The response shape is declared once as a Laravel API Resource, `cms/app/Http/Resources/PropertyResource.php`, and mirrored as a TypeScript type in `web/src/types/property.ts`:

```ts
export type PropertyCategory = 'resort' | 'villa' | 'hotel'

export interface Property {
  id: number
  title: string
  slug: string
  category: PropertyCategory
  location: string
  excerpt: string
  image_url: string
  image_alt: string
  price_from: number | null
  currency: string
  rating: number | null
  cta_url: string | null
  sort_order: number
}

export interface PropertyListResponse {
  data: Property[]
  meta: { count: number }
}
```

**Rule.** Any change to the resource and this type ships in the same commit. This is the specific defence against the production defect in PRD ch. 2.3, where the frontend consumed a field the API never returned and nothing detected it.

The rule is enforced from both ends, against the key list in ch. 3.3 written out by hand in each place:

| Where | What it catches |
| --- | --- |
| `cms/tests/Feature/Api/V1/PropertyIndexTest.php` | The resource returning a different key set from the documented one, asserted against a real response |
| `web/src/types/property.test.ts` | The TypeScript interface drifting from the same list. `tsc` locks its fixtures to the interface, and the assertions lock the fixtures to the list |

Neither test asks the code under test what its fields are. A test that does cannot notice the code returning the wrong thing.

---

## 7. Consumption Contract

How the frontend is required to call this API.

| Rule | Detail |
| --- | --- |
| Server side only | The API is called from Server Components. No browser fetch, so the API base URL never needs to be publicly reachable |
| Single access module | `lib/api/properties.ts` is the only module aware of the base URL and response shape |
| Caching | `next: { revalidate: 60, tags: ['properties'] }` |
| Timeout | 5 seconds. A slow CMS must not hold the homepage hostage |
| Failure handling | Catch, log server side, return an empty result with an error flag. Never throw into the render tree |

### 7.1 Required frontend behaviour on failure

| Condition | Behaviour | Requirement |
| --- | --- | --- |
| `200` with items | Render the grid | - |
| `200` with an empty array | Hide the entire section, heading included | F4 |
| `4xx` or `5xx` | Render a short fallback line in place of the grid. The rest of the page renders normally | F5 |
| Timeout or network error | Same as above | F5 |

A failing section must never produce a full page error. This is verified by an end to end test that stops the CMS and asserts the homepage still renders.
