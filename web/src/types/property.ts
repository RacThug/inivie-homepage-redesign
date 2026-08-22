/**
 * The payload of `GET /api/v1/properties`, mirroring `PropertyResource`
 * in the CMS. docs/API-SPEC.md ch. 3.3 is the authority on both.
 *
 * These two declarations change in the same commit as the resource, in
 * one pull request touching both applications. Splitting them is what
 * lets an API and its consumer drift apart silently, which is the
 * production defect recorded in docs/PRD.md ch. 2.3.
 */

export type PropertyCategory = "resort" | "villa" | "hotel";

export interface Property {
  id: number;
  title: string;
  slug: string;
  category: PropertyCategory;
  location: string;
  excerpt: string;
  /** Absolute, and built by the CMS. The frontend never assembles it (P6). */
  image_url: string;
  image_alt: string;
  /**
   * Whole currency units, or null. Null means the card omits the price
   * row rather than rendering a zero (rule D7).
   */
  price_from: number | null;
  /** ISO 4217. */
  currency: string;
  /** One decimal, or null, in which case the card omits the rating. */
  rating: number | null;
  /** Null renders the card button inert rather than broken. */
  cta_url: string | null;
  sort_order: number;
}

/**
 * Always an object, never a bare array (P3), so `meta` can grow without
 * that being a breaking change.
 */
export interface PropertyListResponse {
  data: Property[];
  meta: { count: number };
}
