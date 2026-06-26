import AffiliateLink from "@/components/affiliate/AffiliateLink";
import ToonloraLogo from "@/components/ui/ToonloraLogo";
import { BRAND_TAGLINE } from "@/lib/brand";
import { HOME_BROWSE_NAV } from "@/lib/homeBrowseNav";

const FOOTER_LINKS = [
  { href: "/", label: "Browse" },
  { href: "/profile", label: "My Library" },
  { href: "/subscribe", label: "Subscribe" },
] as const;

const FOOTER_CATEGORIES = HOME_BROWSE_NAV.filter(
  (item) => item.id !== "home" && item.id !== "this-week"
);

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[#E7DDCC] bg-[#F6F1E7]">
      <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <AffiliateLink href="/" className="inline-flex">
              <ToonloraLogo variant="compact" iconSize={32} />
            </AffiliateLink>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#64748B]">
              {BRAND_TAGLINE}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
              Categories
            </p>
            <ul className="mt-3 space-y-2">
              {FOOTER_CATEGORIES.map((category) => (
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
              Platform
            </p>
            <ul className="mt-3 space-y-2">
              {FOOTER_LINKS.map((link) => (
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
              Partners
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <AffiliateLink
                  href="/partners/affiliate"
                  className="text-sm font-semibold text-[#2F80ED] transition hover:text-[#1F6FD6]"
                >
                  Affiliate
                </AffiliateLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#E7DDCC] pt-6 text-center sm:text-left">
          <p className="text-xs text-[#64748B]">
            © {year} Toonlora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
