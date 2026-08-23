/**
 * Four words, read out and never seen, at the end of a link that leaves the
 * site for a new tab.
 *
 * A new tab takes the back button away, and a visitor who cannot see the tab
 * strip has no way of knowing that until they try to go back and nothing
 * happens. Sighted visitors get the same warning from the browser itself, so
 * this is the one piece of the affordance that has to be written down.
 *
 * The leading space is load bearing. Without it the hint runs into whatever
 * precedes it and the link is announced as one word ending in "Balionens in a
 * new tab", which is the failure this exists to fix, in miniature.
 *
 * It goes last, so the name of the thing is read before the mechanics of
 * reaching it.
 */
export function NewTabHint() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}
