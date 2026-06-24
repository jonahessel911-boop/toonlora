"use client";

import Link from "next/link";
import { useCatalog } from "@/hooks/useCatalog";
import { BRAND_HEADLINE, BRAND_SUBHEADLINE, BRAND_TAGLINE } from "@/lib/brand";

export default function BrowseHero() {
  const { series: featured } = useCatalog({ sort: "featured", limit: 1 });
  const readHref = featured[0]
    ? `/story/${featured[0].id}/read`
    : "#originals";

  return (
    <section className="relative overflow-hidden bg-nav-bg text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(59,158,255,0.25), transparent 42%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.06), transparent 38%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-16 md:py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
          {BRAND_TAGLINE}
        </p>
        <h1 className="font-heading mt-3 max-w-2xl text-[2rem] font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-[2.75rem]">
          {BRAND_HEADLINE}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
          {BRAND_SUBHEADLINE}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={readHref}
            className="btn-coral min-h-[48px] px-8 text-base font-extrabold sm:min-w-[180px]"
          >
            Read now
          </Link>
          <Link
            href="#originals"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-white/25 bg-white/5 px-8 text-base font-semibold backdrop-blur-sm transition hover:bg-white/10 sm:min-w-[180px]"
          >
            Browse originals
          </Link>
        </div>
      </div>
      <div className="h-6 bg-background sm:h-8" aria-hidden />
    </section>
  );
}
