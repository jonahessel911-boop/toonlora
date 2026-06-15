"use client";

import Link from "next/link";
import { useCatalog } from "@/hooks/useCatalog";

export default function BrowseHero() {
  const { series: featured } = useCatalog({ sort: "featured", limit: 1 });
  const readHref = featured[0]
    ? `/story/${featured[0].id}/read`
    : "#originals";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#5340FF] via-[#6D4CFF] to-[#2A114B] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.22), transparent 42%), radial-gradient(circle at 85% 10%, rgba(255,224,51,0.12), transparent 38%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-16 md:py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/85">
          Episode 1 is free
        </p>
        <h1 className="font-heading mt-3 max-w-2xl text-[2rem] font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-[2.75rem]">
          Start reading cartoon stories for free.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/88 sm:text-lg">
          Handpicked episodes from Toonlora and creators. Create your own when
          you&apos;re ready — with credits.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={readHref}
            className="btn-coral min-h-[48px] px-8 text-base font-extrabold sm:min-w-[180px]"
          >
            Start reading
          </Link>
          <Link
            href="#originals"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-white/35 bg-white/10 px-8 text-base font-semibold backdrop-blur-sm transition hover:bg-white/15 sm:min-w-[180px]"
          >
            Browse originals
          </Link>
        </div>
      </div>
      <div className="h-6 bg-[#FCFAFF] sm:h-8" aria-hidden />
    </section>
  );
}
