import type { ReactNode } from "react";
import Link from "next/link";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

interface HomeSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: ReactNode;
  /** white = card surface; soft = subtle gray; dark = navy hero; clear = transparent on page bg */
  tone?: "white" | "soft" | "dark" | "clear";
}

export default function HomeSection({
  id,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View all",
  children,
  tone = "white",
}: HomeSectionProps) {
  const toneClass =
    tone === "dark"
      ? "bg-[#0A1628]"
      : tone === "soft"
        ? "bg-surface-soft/60"
        : tone === "clear"
          ? "bg-transparent"
          : "bg-surface";

  const titleClass =
    tone === "dark" ? "text-white" : "text-primary";
  const subtitleClass =
    tone === "dark" ? "text-white/55" : "text-muted";
  const linkClass =
    tone === "dark"
      ? "text-white/50 hover:text-accent"
      : "text-muted hover:text-accent";

  return (
    <section
      id={id}
      className={`scroll-mt-[7.5rem] py-10 md:py-14 ${toneClass}`}
    >
      <div className={PAGE_CONTAINER_CLASS}>
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-7">
          <div className="min-w-0">
            <h2
              className={`font-heading text-xl font-extrabold tracking-tight md:text-[1.65rem] ${titleClass}`}
            >
              {title}
            </h2>
            {subtitle ? (
              <p className={`mt-1.5 text-sm md:text-base ${subtitleClass}`}>
                {subtitle}
              </p>
            ) : null}
          </div>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className={`flex-shrink-0 text-sm font-semibold transition ${linkClass}`}
            >
              {viewAllLabel} ›
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
