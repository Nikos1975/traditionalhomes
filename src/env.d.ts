/// <reference path="../.astro/types.d.ts" />

/**
 * `rel` is a valid attribute on `<form>` in the HTML Living Standard
 * (it controls link/window relationships for `target="_blank"` submissions),
 * but Astro's built-in `FormHTMLAttributes` does not declare it yet.
 * Declaring it here keeps `rel="noopener noreferrer"` on booking forms
 * type-checked instead of suppressed.
 */
declare namespace astroHTML.JSX {
  interface FormHTMLAttributes {
    rel?: string | undefined | null;
  }
}
