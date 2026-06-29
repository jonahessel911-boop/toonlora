"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import ToonloraLogo from "@/components/ui/ToonloraLogo";
import { useBrowseNav } from "@/hooks/useBrowseNav";
import { useTranslations } from "next-intl";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const tNav = useTranslations("nav");
  const tBrand = useTranslations("brand");
  const browseNav = useBrowseNav();

  const footerCategories = browseNav.filter(
    (item) => item.id !== "home" && item.id !== "this-week"
  );

  const footerLinks = [
    { href: "/", label: tNav("browse") },
    { href: "/profile", label: tNav("myLibrary") },
    { href: "/subscribe", label: tNav("subscribe") },
  ] as const;

  return (
    <footer className="mt-auto border-t border-[#E7DDCC] bg-[#F6F1E7]">
      <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <AffiliateLink href="/" className="inline-flex">
              <ToonloraLogo variant="compact" iconSize={32} />
            </AffiliateLink>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#64748B]">
              {tBrand("tagline")}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
              {tNav("categories")}
            </p>
            <ul className="mt-3 space-y-2">
              {footerCategories.map((category) => (
                <li key={category.id}>
                  <AffiliateLink
                    href={category.href}
                    className="text-sm font-semibold text-[#2F80ED] transition hover:text-[#1F6FD6]"
                  >
                    {category.label}
                  </AffiliateLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
              {tNav("platform")}
            </p>
            <ul className="mt-3 space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <AffiliateLink
                    href={link.href}
                    className="text-sm font-medium text-[#64748B] transition hover:text-[#2F80ED]"
                  >
                    {link.label}
                  </AffiliateLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
              {tNav("partners")}
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <AffiliateLink
                  href="/partners/affiliate"
                  className="text-sm font-semibold text-[#2F80ED] transition hover:text-[#1F6FD6]"
                >
                  {tNav("affiliate")}
                </AffiliateLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#E7DDCC] pt-6 text-center sm:text-left">
          <p className="text-xs text-[#64748B]">
            {tBrand("copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
