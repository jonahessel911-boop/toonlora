import { defineRouting } from "next-intl/routing";

export const LOCALES = ["en", "nl", "de", "es", "pt", "fr"] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

export const routing = defineRouting({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "never",
  localeDetection: true,
});
