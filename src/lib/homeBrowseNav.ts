/** Homepage browse tabs — shared by Navbar and section anchors. */
import { BROWSE_CONTENT_CATEGORIES } from "@/lib/browseCategories";

export const HOME_BROWSE_NAV = [
  { id: "home", href: "/", label: "Home" },
  { id: "this-week", href: "/#this-week", label: "This Week" },
  ...BROWSE_CONTENT_CATEGORIES.map((category) => ({
    id: category.sectionId,
    href: `/#${category.sectionId}` as const,
    label: category.label,
  })),
] as const;

export type HomeBrowseSectionId = (typeof HOME_BROWSE_NAV)[number]["id"];

/** Section blurbs for browse rails (no mock story cards). */
export const HOME_SECTION_SUBTITLES: Partial<Record<HomeBrowseSectionId, string>> =
  Object.fromEntries(
    BROWSE_CONTENT_CATEGORIES.map((category) => [
      category.sectionId,
      category.subtitle,
    ])
  );
