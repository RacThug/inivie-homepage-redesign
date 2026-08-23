/**
 * The Culinary Journey and Wellness Harmony Escape.
 *
 * One module for two sections, because the design brief ch. 4.5 asks them to
 * read as a pair rather than as two unrelated treatments. Sharing the shape
 * here is what keeps that true: a field added for restaurants cannot quietly
 * fail to arrive for spas.
 *
 * Both are static today. Both are also plausible next candidates for the CMS
 * (PRD ch. 5.2 scores them at 17), which is exactly why they are typed data
 * rather than markup: promoting one means replacing the import below with a
 * fetch, not rewriting `VenueCard`.
 */

export interface Venue {
  readonly name: string;
  /** What kind of place it is, at a glance. Production's own words. */
  readonly category: string;
  readonly location: string;
  readonly image: string;
  readonly imageAlt: string;
}

export interface VenueSectionContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly intro: string;
  readonly action: { readonly label: string; readonly href: string };
  readonly venues: readonly Venue[];
}

/**
 * The eyebrow names the sub-brand rather than repeating the heading, which is
 * how a visitor learns that Wonderspace and Svaha Wellness exist at all. The
 * header no longer carries them: navigation there is grouped by what a guest
 * came to do, not by how the company is organised (brief ch. 4.1).
 */
export const CULINARY: VenueSectionContent = {
  eyebrow: "Wonderspace",
  heading: "The Culinary Journey",
  intro: "Opening a new chapter in refined dining experience.",
  action: { label: "All restaurants", href: "/dine" },
  venues: [
    {
      name: "Norii Seminyak",
      category: "Japanese",
      location: "Seminyak, Bali",
      image: "/home/culinary/norii-seminyak.webp",
      imageAlt:
        "A sharing platter of nigiri, sashimi and rolls on a stone board at Norii Seminyak.",
    },
    {
      name: "Riserva Steakhouse",
      category: "Immersive dining",
      location: "Ubud, Bali",
      image: "/home/culinary/riserva-steakhouse.webp",
      imageAlt:
        "A sliced steak with roasted garlic and rosemary on a white platter at Riserva Steakhouse.",
    },
    {
      name: "Terra Verte",
      category: "Mediterranean",
      location: "Ubud, Bali",
      image: "/home/culinary/terra-verte.webp",
      imageAlt:
        "A table at Terra Verte laid with bread, mezze bowls, salads and a burger, seen from above.",
    },
  ],
} as const;

export const WELLNESS: VenueSectionContent = {
  eyebrow: "Svaha Wellness",
  heading: "Wellness Harmony Escape",
  intro: "Find serenity in soulful rituals made to restore.",
  action: { label: "All spas", href: "/wellness" },
  venues: [
    {
      name: "Svaha Spa Ajowa",
      category: "Spa",
      location: "Seminyak, Bali",
      image: "/home/wellness/svaha-spa-ajowa.webp",
      imageAlt:
        "A therapist working on a guest's shoulders in a low lit treatment room at Svaha Spa Ajowa.",
    },
    {
      name: "Svaha Spa La Mewali",
      category: "Spa",
      location: "Canggu, Bali",
      image: "/home/wellness/svaha-spa-la-mewali.webp",
      imageAlt:
        "A guest face down on a treatment bed during a back massage at Svaha Spa La Mewali.",
    },
    {
      name: "Svaha Spa Bisma",
      category: "Spa",
      location: "Ubud, Bali",
      image: "/home/wellness/svaha-spa-bisma.webp",
      imageAlt:
        "Two therapists in ikat working side by side on a couple against a carved stone wall at Svaha Spa Bisma.",
    },
  ],
} as const;
