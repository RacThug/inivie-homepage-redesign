import { HEAD_OFFICE, SOCIAL_LINKS } from "@/content/footer";
import { BRAND_LOGO } from "@/content/navigation";
import { SITE } from "@/content/site";
import { siteUrl } from "@/lib/site";

/**
 * `Organization` structured data, per PRD ch. 8.3 and TECHNICAL-DESIGN
 * ch. 7.2.
 *
 * Every field is read from the content the footer already renders rather than
 * restated here. Structured data that disagrees with the page it is on is the
 * one kind of markup a search engine treats as a reason to distrust the rest,
 * and a second copy of a phone number is exactly how that happens.
 *
 * Returned as a plain object and serialised by the caller, so it can be
 * asserted on in a test without parsing a string out of a script tag.
 */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    description: SITE.description,
    url: siteUrl(),
    logo: siteUrl(BRAND_LOGO.ink),
    image: siteUrl(SITE.image.src),
    email: HEAD_OFFICE.email,
    telephone: HEAD_OFFICE.phone,
    address: {
      "@type": "PostalAddress",
      /*
        The address is published as three display lines and is kept that way.
        Splitting it into locality, region and postal code here would be a
        second copy of the same words, free to drift from the one the footer
        renders, in exchange for fields `Organization` does not require.
      */
      streetAddress: HEAD_OFFICE.lines.join(" "),
      addressCountry: SITE.country,
    },
    hasMap: HEAD_OFFICE.mapUrl,
    sameAs: SOCIAL_LINKS.map((social) => social.href),
  };
}
