/**
 * A control and where it leads.
 *
 * One shape, because the same pair travels through nine content modules and
 * three components, and three private copies of `{ label, href }` is how one
 * of them quietly grows a third field the others never get.
 *
 * It lives in `content/` rather than beside the component that renders it: the
 * words and the destination are content, and a content module importing a type
 * from a component would point the dependency the wrong way round.
 *
 * Brief ch. 4A governs what may go in `label`. Every control names its own
 * destination, and `content/actions.test.ts` checks that across the page.
 */
export interface Action {
  readonly label: string;
  readonly href: string;
}
