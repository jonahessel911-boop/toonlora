import AffiliateLink from "@/components/affiliate/AffiliateLink";
import { BRAND_TAGLINE } from "@/lib/brand";
import { PLATFORM_TOPICS } from "@/lib/platformTopics";

const FOOTER_LINKS = [
  { href: "/", label: "Browse" },
  { href: "/profile", label: "My Library" },
  { href: "/subscribe", label: "Subscribe" },
] as const;

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[#E7DDCC] bg-[#F6F1E7]">
      <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-heading text-lg font-extrabold text-[#0E1726]">
              Toonlora
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#64748B]">
              {BRAND_TAGLINE}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
              Topics
            </p>
            <ul className="mt-3 space-y-2">
              {PLATFORM_TOPICS.map((topic) => (
                <li key={topic.id}>
                  <AffiliateLink
                    href={`/#categories?topic=${topic.id}`}
                    className="text-sm font-semibold text-[#2F80ED] transition hover:text-[#1F6FD6]"
                  >
                    {topic.label} Stories
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

        <div className="mt-10 flex flex-col gap-2 border-t border-[#E7DDCC] pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-[#64748B]">
            © {year} Toonlora. All rights reserved.
          </p>
          <p className="text-xs text-[#64748B]">Business Stories</p>
        </div>
      </div>
    </footer>
  );
}
