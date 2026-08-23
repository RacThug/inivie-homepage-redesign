/**
 * Featured In, a row of media logos in greyscale.
 *
 * **Eight, not production's nine.** Production serves the row as
 * `logomedia/1.png` through `10.png`, every one of them with no alternative
 * text at all, so a screen reader is read nine files and told nothing. Eight
 * of the nine marks are wordmarks or a mark that can be matched against the
 * publication's own site, and those eight are named below. The ninth is a
 * script monogram whose owner could not be established from any source, and
 * an unnamed logo in a "featured in" row is a claim nobody can check, so it
 * is left out rather than captioned with a guess.
 *
 * That is the same correction PRD ch. 2.3 makes twice already: production's
 * contract fails quietly, and this project makes it say what it means.
 */

export interface Publication {
  readonly name: string;
  readonly logo: string;
}

export const FEATURED_IN = {
  /**
   * The section's whole header, and the only words in it. Production and the
   * design pass both set this label and nothing else, so there is no heading
   * beneath it to write: a sentence invented to fill that gap would be the
   * placeholder copy the brief ch. 7 rules out.
   *
   * It is still the section's heading in the document, set at the eyebrow
   * scale. A landmark has to be named by something a reader can see, and this
   * is the something.
   */
  heading: "Featured In",
  publications: [
    { name: "Honeycombers", logo: "/home/media/honeycombers.png" },
    { name: "The Bali Bible", logo: "/home/media/the-bali-bible.png" },
    { name: "Urban List", logo: "/home/media/urban-list.png" },
    { name: "Asian Wanderlust", logo: "/home/media/asian-wanderlust.png" },
    { name: "Indonesia Expat", logo: "/home/media/indonesia-expat.png" },
    { name: "The Bali Guideline", logo: "/home/media/the-bali-guideline.png" },
    { name: "NOW! Bali", logo: "/home/media/now-bali.png" },
    { name: "epicure", logo: "/home/media/epicure.png" },
  ] as readonly Publication[],
} as const;
