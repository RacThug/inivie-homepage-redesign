/**
 * The words on a carousel's controls.
 *
 * None of them are visible. The steps are chevrons and the dots are marks, so
 * each string here is the whole of what a control says when it is read out,
 * which is why they live in the content layer beside every other word on the
 * page rather than inside the component that draws them.
 *
 * Each carousel names what it moves rather than which way it points. "Next
 * property" and "Next spa" are answers where "Next" is half of one, and a page
 * carrying three carousels would otherwise offer three identical controls.
 */
export interface CarouselLabels {
  /**
   * Names the carousel. It deliberately omits the word carousel, which
   * `aria-roledescription` already supplies and which would otherwise be
   * announced twice.
   */
  readonly label: string;
  readonly previous: string;
  readonly next: string;
  /**
   * Names the card a dot reaches, so six dots are told apart rather than
   * counted. A sentence with `{name}` in it, which the carousel fills in.
   *
   * A function would read better here and cannot be used. These labels are
   * handed from a Server Component to a client one, and React serialises what
   * crosses that boundary: a function is refused outright, at request time,
   * which is a 500 rather than a type error. The template literal type is what
   * makes the placeholder a compile time requirement instead of a convention.
   */
  readonly goTo: `${string}{name}${string}`;
}
