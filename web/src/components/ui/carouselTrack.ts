/**
 * The geometry every carousel on the page shares, written once.
 *
 * Four things have to agree on it: the carousel itself, the two kinds of card
 * that ride it, the skeleton that holds Featured Properties open while the CMS
 * is read, and the `sizes` each card's image is fetched at. Written out four
 * times they agree today and disagree after the first breakpoint change, and
 * both failures are silent ones - a skeleton that shifts the page it exists to
 * hold still, and a phone that downloads a desktop asset, which is requirement
 * RS4.
 */

/**
 * The window the track moves behind. `overflow-hidden` is what makes it one,
 * and the asymmetric padding is room for the card shadow rather than spacing:
 * `--shadow-raised` reaches 28px below a card and 2px above it, so a viewport
 * that ends at the card's own box clips the shadow off the bottom of every
 * slide. The controls sit closer underneath to give the padding back.
 *
 * The mask is what makes the two cards at the edges read as continuing rather
 * than as broken. A centred track always cuts them - that is the whole of the
 * effect - and about a ninth of each one falls outside the container. Cut
 * square, that ninth ends mid word and looks like a clipping fault; faded out
 * over the last stretch of the window, it reads as a card carrying on past the
 * edge of the page. The fade is short on a phone, where the peek is 42px wide
 * and a long one would swallow it whole, taking the carousel with it: a single
 * card centred in white space is not one.
 */
export const CAROUSEL_VIEWPORT =
  "overflow-hidden pt-2 pb-8 [mask-image:linear-gradient(to_right,transparent,#000_0.75rem,#000_calc(100%-0.75rem),transparent)] lg:[mask-image:linear-gradient(to_right,transparent,#000_3rem,#000_calc(100%-3rem),transparent)]";

/**
 * The gutter is the card grid's own, 20px and 32px from the desktop
 * breakpoint (DESIGN-SYSTEM ch. 4.1). It is padding inside each slide, with
 * the container cancelling the first one, rather than a `gap`: Embla measures
 * slide boxes, and a `gap` is space that belongs to no slide, so alignment
 * drifts by a gutter more with every slide the track is scrolled.
 */
export const CAROUSEL_CONTAINER = "flex -ml-5 touch-pan-y lg:-ml-8";

/**
 * Slide widths, and with them the whole of the centre mode effect: a slide
 * narrower than the viewport is what leaves the neighbouring cards showing at
 * both edges, and the carousel's `align: center` is what puts the selected
 * card between them. 72% on a phone, 56% from the tablet breakpoint, 36% from
 * desktop, which is a little over two and a half cards in view.
 *
 * The phone value is the one that took measuring. The gutter is inside the
 * slide, so it comes out of the peek rather than out of the card, and at 84%
 * the peek was 20px wide with a 20px fade over it, which left a single card
 * centred in white space and no carousel at all.
 *
 * `min-w-0` because a flex item's floor is its content, and a card holding a
 * long unbroken title would otherwise push its slide wider than the basis
 * here says it is.
 */
export const CAROUSEL_SLIDE =
  "min-w-0 shrink-0 grow-0 basis-[72%] pl-5 sm:basis-[56%] lg:basis-[36%] lg:pl-8";

/** Directly under the viewport, whose bottom padding is already the gap. */
export const CAROUSEL_CONTROLS = "mt-2 flex items-center justify-center gap-2";

/**
 * What one slide's image is worth at each breakpoint, which is the width
 * above less that breakpoint's gutter. At 1280 the container is 1201px wide
 * (DESIGN-SYSTEM ch. 7.2), so 36% of it less 32px of gutter is 400px.
 */
export const CAROUSEL_IMAGE_SIZES =
  "(min-width: 1280px) 400px, (min-width: 1024px) 34vw, (min-width: 640px) 54vw, 82vw";
