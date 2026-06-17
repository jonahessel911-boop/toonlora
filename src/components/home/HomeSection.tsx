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
  /** White default; soft = lavender tint */
  tone?: "white" | "soft";
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
  return (
    <section
      id={id}
      className={`scroll-mt-[7.5rem] py-12 md:py-[72px] ${
        tone === "soft" ? "bg-[#F3ECFF]/40" : "bg-white"
      }`}
    >
      <div className={PAGE_CONTAINER_CLASS}>
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
          <div className="min-w-0">
            <h2 className="font-heading text-xl font-extrabold tracking-tight text-[#101828] md:text-[1.75rem]">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1.5 text-sm text-[#667085] md:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="flex-shrink-0 text-sm font-semibold text-[#667085] transition hover:text-[#5340FF]"
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
