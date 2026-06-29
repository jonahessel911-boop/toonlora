import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALES, type AppLocale } from "./routing";

function detectLocaleFromAcceptLanguage(acceptLanguage: string | null): AppLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase().slice(0, 2))
    .filter(Boolean);

  for (const code of preferred) {
    if (LOCALES.includes(code as AppLocale)) {
      return code as AppLocale;
    }
  }

  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  let locale: AppLocale = DEFAULT_LOCALE;

  if (cookieLocale && LOCALES.includes(cookieLocale as AppLocale)) {
    locale = cookieLocale as AppLocale;
  } else {
    const headerStore = await headers();
    locale = detectLocaleFromAcceptLanguage(headerStore.get("accept-language"));
  }

  return {
    locale,
    messages: (await import(`../../locales/${locale}.json`)).default,
  };
});
