import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { buildBrowseNav } from "@/lib/i18n/browse-nav";

export function useBrowseNav() {
  const tNav = useTranslations("nav");
  const tCategories = useTranslations("categories");

  return useMemo(
    () =>
      buildBrowseNav(
        (key) => tNav(key as Parameters<typeof tNav>[0]),
        (key) => tCategories(key as Parameters<typeof tCategories>[0])
      ),
    [tNav, tCategories]
  );
}
