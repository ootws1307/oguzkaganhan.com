import type { TextOrigin } from "@repo/db";

/**
 * Language of text we did not write in a known locale (repo names, READMEs,
 * tech names). Turkish-only letters mean Turkish; anything else is treated as
 * English so `text-transform: uppercase` on a Turkish page does not turn
 * "license" into "LİCENSE".
 */
export function textLang(text: string): "tr" | "en" {
  return /[ğĞşŞıİ]/.test(text) ? "tr" : "en";
}

/** `lang` attribute for project text: admin text inherits the page's locale. */
export function langFor(origin: TextOrigin, text: string): "tr" | "en" | undefined {
  return origin === "repo" ? textLang(text) : undefined;
}
