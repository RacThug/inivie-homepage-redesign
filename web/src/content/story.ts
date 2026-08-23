/**
 * Our Story, told through the eight mantras.
 *
 * The four subsections are groupings of the mantras rather than generic
 * about-us copy, per the brief ch. 4.7. Production buries Mantras and
 * Sustainability in a secondary menu; surfacing them here is deliberate, and
 * it is why the header could drop to six items.
 *
 * One correction to production's own words. Its intro reads "iNi ViE
 * Hospitality guided by eight mantras", which is missing its verb. That is a
 * grammatical error rather than a house punctuation style, so it is fixed here
 * for the same reason the FAQ's "Ini Vie" is: a sentence a visitor has to
 * re-read is a defect whoever wrote it would want back.
 *
 * The pairing below is not the design pass's. That pass put Mother Earth and
 * Sustainability Impact under "Our Eight Mantras" and Technology Adaptation
 * under "Sustainability", which reads as a shuffle rather than a grouping.
 * Each subsection now carries the two mantras its own paragraph is about.
 */

import type { Action } from "./action";

export interface StoryImage {
  readonly src: string;
  readonly alt: string;
}

export interface StoryChapter {
  readonly heading: string;
  /** The two mantras this chapter carries, joined in the markup rather than
   *  in the string, so the separator is a style decision and not content. */
  readonly mantras: readonly [string, string];
  readonly body: string;
  readonly action: Action;
}

export const STORY = {
  eyebrow: "Who We Are",
  heading: "Our Story",
  intro:
    "iNi ViE Hospitality is guided by eight mantras that honour people, culture, and nature. Through deeply personalised stays, distinctive resorts and villas, meaningful dining, wellness, and lifestyle experiences, we create memorable journeys across Bali with sustainability at the heart of every decision.",
  images: [
    {
      src: "/home/story/1.webp",
      alt: "Thatched villa roofs above a rice terrace in Ubud, under a wide afternoon sky.",
    },
    {
      src: "/home/story/2.webp",
      alt: "A host in Balinese dress welcoming two guests in front of a carved timber screen.",
    },
    {
      src: "/home/story/3.webp",
      alt: "Two staff members washing arriving guests' feet in copper bowls at check in.",
    },
  ] as readonly StoryImage[],
  chapters: [
    {
      heading: "About Us",
      mantras: ["Empowering Local People", "Intentional Personalization"],
      body: "iNi ViE Hospitality manages a growing portfolio of luxury resorts, private pool villas, restaurants, spas, beach clubs, family attractions, and curated experiences in Bali. Our approach combines local culture, contemporary hospitality, and experience-led concepts to create journeys that feel personal, relevant, and worth returning to.",
      action: { label: "About us", href: "/about" },
    },
    {
      heading: "What Makes Us Different",
      mantras: ["Technology Adaptation", "Pioneer Concept"],
      body: "What makes iNi ViE Hospitality different is our seamless multi-experience journey, combining stays, dining, wellness, culture, leisure, and celebration in one thoughtfully connected guest experience across our portfolio. Supported with distinctive design, personalised service, and consistently high hospitality standards, every touchpoint is designed to feel personal, seamless, and memorable.",
      action: { label: "Why choose us", href: "/why-choose-us" },
    },
    {
      heading: "Our Eight Mantras",
      mantras: ["Respect Local Culture", "Meaningful Story Telling"],
      body: "Eight Mantras are the values behind everything we do, inspiring thoughtful hospitality, responsible operations, stronger communities, and meaningful guest experiences across our resorts, villas, restaurants, wellness, and lifestyle destinations.",
      action: { label: "Read the mantras", href: "/mantras" },
    },
    {
      heading: "Sustainability",
      mantras: ["Responsible to Mother Earth", "Sustainability Impact"],
      body: "Sustainability is woven into the way iNi ViE Hospitality operates across Bali. We focus on responsible sourcing, reduced waste, efficient use of water and energy, local employment, community partnerships, and respect for Bali's natural and cultural heritage, creating hospitality that benefits guests, people, and place.",
      action: { label: "Our sustainability work", href: "/sustainability" },
    },
  ] as readonly StoryChapter[],
} as const;
