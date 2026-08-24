/**
 * Returning to the top of the document.
 *
 * Two controls do it and they have to do it the same way: the header wordmark,
 * which on the homepage is a link to the route the visitor is already on, and
 * the back to top button of DESIGN-SYSTEM ch. 6.18. Two copies of this would
 * be two chances for one of them to forget `prefers-reduced-motion`.
 */

/**
 * The header wordmark, addressed by id because the button that sends focus
 * there is at the other end of the document and shares no ancestor with it
 * short of `body`. Passing a ref down from the layout would put a client
 * boundary around the whole shell to move focus by one element.
 *
 * The id is declared here rather than in `Header`, so the element that
 * carries it and the code that looks for it are read together.
 */
export const HOME_LINK_ID = "site-home";

/**
 * Read at the moment of the scroll rather than held in state, for the reason
 * `Carousel` gives about the same query: the operating system setting and the
 * display a window is on both change between clicks, and neither one
 * re-renders anything.
 *
 * `globals.css` collapses every CSS transition and animation under this query
 * already. What is left for this to cover is the one piece of motion CSS
 * cannot see, which is the scroll the browser runs itself.
 */
function jumps(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Sends the window home, smoothly unless that has been asked not to. */
export function scrollToTop(): void {
  window.scrollTo({ behavior: jumps() ? "auto" : "smooth", top: 0 });
}

/**
 * Puts focus on the first interactive thing at the top of the page.
 *
 * The back to top button leaves the document the moment the scroll it started
 * reaches the top, and a control that removes itself while focused drops focus
 * onto `body`: the next Tab then starts from the beginning of the page rather
 * than from where the visitor just arrived, which is the whole complaint the
 * button was answering. Focus is handed somewhere real before that happens.
 *
 * `preventScroll` because the smooth scroll is already running. Without it the
 * browser jumps to the element first and the animation has nowhere to go.
 */
export function focusPageTop(): void {
  document.getElementById(HOME_LINK_ID)?.focus({ preventScroll: true });
}
