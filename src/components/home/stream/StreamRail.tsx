import Link from "next/link";
import type { ReactNode } from "react";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import StreamRailScroller from "@/components/home/stream/StreamRailScroller";

interface StreamRailProps {
  id?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  compact?: boolean;
  dense?: boolean;
  noTopBorder?: boolean;
  children: ReactNode;
}

export default function StreamRail({
  id,
  title,
  subtitle,
  viewAllHref,
  compact = false,
  dense = false,
  noTopBorder = false,
  children,
}: StreamRailProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 border-b border-[#E7DDCC] bg-[#F6F1E7] ${
        compact ? "py-5 md:py-6" : "py-9 md:py-11"
      } ${noTopBorder ? "" : "border-t"}`}
    >
      <div className={PAGE_CONTAINER_CLASS}>
        <div
          className={`flex items-end justify-between gap-4 ${compact ? "mb-2.5" : "mb-4"}`}
        >
          <div className="min-w-0">
            <h2 className="font-heading text-xl font-extrabold tracking-tight text-[#0E1726] md:text-2xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-[#64748B] md:text-base">{subtitle}</p>
            ) : null}
          </div>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="shrink-0 text-sm font-semibold text-[#64748B] transition hover:text-[#2F80ED]"
            >
              View all ›
            </Link>
          ) : null}
        </div>
        <StreamRailScroller dense={dense}>{children}</StreamRailScroller>
      </div>
    </section>
  );
}
