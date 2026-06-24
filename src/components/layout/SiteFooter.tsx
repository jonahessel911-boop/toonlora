import Link from "next/link";
import { PLATFORM_TOPICS } from "@/lib/platformTopics";
import { BRAND_TAGLINE } from "@/lib/brand";

const FOOTER_LINKS = [
  { href: "/", label: "Browse" },
  { href: "/profile", label: "Profile" },
] as const;

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 xl:max-w-[1440px] xl:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-heading text-lg font-extrabold text-primary">
              Toonlora
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              {BRAND_TAGLINE}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Topics
            </p>
            <ul className="mt-3 space-y-2">
              {PLATFORM_TOPICS.map((topic) => (
                <li key={topic.id}>
                  <Link
                    href={`/#categories?topic=${topic.id}`}
                    className="text-sm font-semibold text-accent hover:text-primary"
                  >
                    {topic.label} Stories
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Platform
            </p>
            <ul className="mt-3 space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-muted hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Partners
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/partners/affiliate"
                  className="text-sm font-semibold text-accent hover:text-primary"
                >
                  Affiliate
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-muted">
            © {year} Toonlora. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            Business Stories
          </p>
        </div>
      </div>
    </footer>
  );
}
