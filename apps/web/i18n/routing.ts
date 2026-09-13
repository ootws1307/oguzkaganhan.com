import { defaultLocale, locales } from "@repo/content";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
