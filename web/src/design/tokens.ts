/**
 * Reads the Tailwind theme block out of a stylesheet.
 *
 * The palette in DESIGN-SYSTEM ch. 2.1 is declared once, in `app/globals.css`.
 * Copying those hex values into TypeScript so tests could assert on them would
 * create exactly the kind of silent drift this project exists to avoid, so the
 * tests parse the real stylesheet instead.
 */

const THEME_BLOCK = /@theme[^{]*\{/;
const COLOR_DECLARATION = /--color-([a-z0-9-]+)\s*:\s*([^;]+);/gi;
const COLOR_REFERENCE = /^var\(\s*--color-([a-z0-9-]+)\s*\)$/i;

/** Extracts the body of the first `@theme` block, honouring nested braces. */
function readThemeBlock(css: string): string {
  const opening = THEME_BLOCK.exec(css);

  if (!opening) {
    throw new Error("Stylesheet declares no @theme block");
  }

  const start = opening.index + opening[0].length;
  let depth = 1;

  for (let index = start; index < css.length; index += 1) {
    const character = css[index];

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return css.slice(start, index);
      }
    }
  }

  throw new Error("The @theme block is never closed");
}

/**
 * Follows a `var(--color-x)` chain to the literal value at the end of it.
 *
 * A semantic token such as `on-accent` records a decision, but its value is
 * another token. Resolving the reference keeps the underlying colour declared
 * exactly once.
 */
function resolve(
  name: string,
  raw: Record<string, string>,
  seen: readonly string[] = [],
): string {
  if (seen.includes(name)) {
    throw new Error(
      `Circular colour token reference: ${[...seen, name].join(" -> ")}`,
    );
  }

  const value = raw[name];
  const reference = COLOR_REFERENCE.exec(value);

  if (!reference) {
    return value;
  }

  const target = reference[1];

  if (!(target in raw)) {
    throw new Error(
      `Colour token --color-${name} references --color-${target}, which is not declared`,
    );
  }

  return resolve(target, raw, [...seen, name]);
}

/**
 * Maps every `--color-*` entry in the theme block to its value, keyed by the
 * name Tailwind uses to build utility classes. `--color-ink-muted` becomes
 * `ink-muted`, the token behind `text-ink-muted`.
 */
export function parseColorTokens(css: string): Record<string, string> {
  const theme = readThemeBlock(css);
  const raw: Record<string, string> = {};

  for (const [, name, value] of theme.matchAll(COLOR_DECLARATION)) {
    raw[name] = value.trim();
  }

  return Object.fromEntries(
    Object.keys(raw).map((name) => [name, resolve(name, raw)]),
  );
}
