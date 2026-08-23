/**
 * The text a sighted reader sees, with anything `sr-only` left out.
 *
 * A test helper, used by the two layout suites and imported by nothing that
 * ships. It exists because every outbound link in the header and the drawer
 * ends in a hint that is read out and never seen (`NewTabHint`), so
 * `textContent` answers "Souljourn (opens in a new tab)" to a question about
 * what the navigation says.
 *
 * Both readings are worth asserting and they are different assertions. The
 * accessible name, hint included, is what `getByRole(..., { name })` already
 * checks. This is the other one: the label as it is drawn.
 *
 * It walks the whole subtree rather than one level. The elements these
 * assertions are handed are list items and the hint sits inside the link
 * inside them, so a version that only looked at direct children read the hint
 * back out again.
 */
function drawn(node: Node): string {
  if (node instanceof Element) {
    if (node.classList.contains("sr-only")) return "";

    return Array.from(node.childNodes).map(drawn).join("");
  }

  return node.textContent ?? "";
}

export function visibleText(element: Element): string {
  return drawn(element).trim();
}
