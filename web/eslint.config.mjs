import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Formatting is Prettier's job, so the rules that would argue with it are
  // switched off. This must stay last.
  prettier,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    /*
      What `npm run test:e2e` leaves behind. Both are gitignored, and neither
      was ignored here: the HTML report ships its own bundled JavaScript, so
      running the end to end suite and then the linter turned a green gate
      into three thousand problems in vendored code.
    */
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
