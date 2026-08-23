/**
 * Footer content, as data rather than markup, for the reason in
 * `navigation.ts`.
 *
 * The six separate contact routes are kept whole. Production splits enquiries
 * across Reservations, Marketing, Media, Human Resources, Travel Agents and a
 * general line, and that is a sincere signal rather than clutter: it means a
 * job applicant and a travel agent each reach the right desk. None of the six
 * reference sites surveyed in the design brief carries anything like it.
 *
 * Every number and address here is production's own, verified 23 August 2026.
 */

export interface ContactRoute {
  readonly name: string;
  readonly phone?: string;
  readonly email: string;
  /** Secondary actions production offers on some desks and not others. */
  readonly actions?: readonly NamedLink[];
}

export interface NamedLink {
  readonly label: string;
  readonly href: string;
}

export const HEAD_OFFICE = {
  lines: [
    "Jl. Persada II No.888, Kerobokan,",
    "Kec. Kuta Utara,",
    "Kabupaten Badung, Bali 80361",
  ],
  phone: "+62 361 9346082",
  email: "info@inivie.com",
  mapUrl: "https://maps.google.com/?q=Jl.+Persada+II+No.888+Kerobokan+Bali",
} as const;

export const DEPARTMENTS: readonly ContactRoute[] = [
  {
    name: "Reservation",
    phone: "+62 811-3986-889",
    email: "reservation@inivie.com",
  },
  {
    name: "Marketing",
    phone: "+62 812-3868-7387",
    email: "marcom@inivie.com",
  },
  {
    name: "Media Inquiry",
    phone: "+62 813 3753-0285",
    email: "pr@inivie.com",
  },
  {
    name: "Human Resources",
    phone: "+62 812-3729-0110",
    email: "hire@inivie.com",
    actions: [{ label: "View open jobs", href: "/careers" }],
  },
  {
    name: "Travel Agent Inquiry",
    email: "salescoordinator@inivie.com",
  },
] as const;

/**
 * Where the header's twelve paths went. Consultant is a B2B line with nothing
 * to say to a guest reading the homepage, so it belongs here rather than in
 * the primary navigation.
 */
export const COMPANY_LINKS: readonly NamedLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Mantras", href: "/mantras" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Why Choose Us", href: "/why-choose-us" },
  { label: "Blog", href: "https://blog.inivie.com" },
  { label: "Careers", href: "/careers" },
  { label: "Owners", href: "/owners" },
  { label: "Consultant (DP+, DP Construction)", href: "/consultant" },
] as const;

export const SOCIAL_LINKS: readonly NamedLink[] = [
  { label: "Facebook", href: "https://facebook.com/inivie" },
  { label: "Instagram", href: "https://instagram.com/inivie" },
  { label: "LinkedIn", href: "https://linkedin.com/company/inivie" },
  { label: "YouTube", href: "https://youtube.com/@inivie" },
  { label: "TikTok", href: "https://tiktok.com/@inivie" },
] as const;

export const LEGAL = {
  policy: { label: "General Policy", href: "/general-policy" },
  copyright: "2026 iNi ViE Hospitality. All Rights Reserved",
} as const;
