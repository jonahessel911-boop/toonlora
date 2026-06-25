"use client";

import { BRAND_TAGLINE } from "@/lib/brand";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

/** Cinematic hero — black + accent glow, flows into browse sections. */
export default function HomeBrandHero() {
  return (
    <section
      id="this-week"
      className="relative scroll-mt-[7.5rem] overflow-hidden bg-background pb-14 pt-10 md:pb-20 md:pt-14"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,158,255,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className={`${PAGE_CONTAINER_CLASS} relative text-center md:text-left`}>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
          Toonlora Originals
        </p>

        <h1 className="mx-auto mt-4 max-w-3xl font-heading text-3xl font-extrabold leading-[1.08] tracking-tight text-white md:mx-0 md:text-[2.75rem] lg:text-5xl">
          {BRAND_TAGLINE}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/65 md:mx-0 md:text-lg">
          Weekly illustrated chapters about founders, companies, money, failure,
          and billion-dollar decisions.
        </p>
      </div>
    </section>
  );
}
