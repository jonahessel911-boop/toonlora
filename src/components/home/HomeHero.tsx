"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroFeaturedStories from "@/components/home/HeroFeaturedStories";
import { useCatalog } from "@/hooks/useCatalog";
import {
  BRAND_HEADLINE,
  BRAND_SUBHEADLINE,
  BRAND_TAGLINE,
  CREDIT_COPY,
} from "@/lib/brand";

const TRUST_ITEMS = [
  "Chapter 1 free",
  "In-depth business stories",
  "Researched chapters",
  "Create your own",
] as const;

export default function HomeHero() {
  const { series: featured } = useCatalog({ sort: "featured", limit: 4 });

  return (
    <>
      <section className="relative overflow-hidden bg-background">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 0%, rgba(59,158,255,0.08), transparent 40%), radial-gradient(circle at 90% 20%, rgba(10,22,40,0.04), transparent 35%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[1360px] px-5 py-12 sm:px-6 sm:py-14 lg:py-16">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-8 xl:gap-12">
            <div className="w-full min-w-0 text-center lg:w-[48%] lg:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent sm:text-[11px] sm:tracking-[0.18em]">
                {BRAND_TAGLINE}
              </p>

              <h1 className="font-heading mt-4 text-[2rem] font-extrabold leading-[1.12] tracking-tight text-primary sm:text-[2.5rem] md:text-[2.875rem] lg:text-[3.125rem] xl:text-[3.375rem]">
                {BRAND_HEADLINE}
              </h1>

              <p className="mx-auto mt-5 max-w-[480px] text-[15px] leading-relaxed text-muted sm:text-base lg:mx-0 lg:max-w-[520px]">
                {BRAND_SUBHEADLINE}
              </p>

              <div className="mx-auto mt-8 flex max-w-[480px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-center lg:mx-0 lg:justify-start">
                <Link
                  href="#rankings"
                  className="btn-coral min-h-[52px] w-full px-8 text-base font-extrabold sm:w-auto sm:min-w-[196px]"
                >
                  Read now
                </Link>
                <Link
                  href="/create"
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-border bg-surface px-8 text-base font-semibold text-primary transition hover:border-primary/20 hover:bg-surface-soft active:scale-[0.98] sm:w-auto sm:min-w-[196px]"
                >
                  Create a story
                </Link>
              </div>

              <p className="mx-auto mt-4 max-w-[480px] text-sm text-muted lg:mx-0">
                {CREDIT_COPY}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full min-w-0 lg:w-[52%]"
            >
              <HeroFeaturedStories stories={featured} />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface py-5 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-8">
            {TRUST_ITEMS.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted sm:text-sm"
              >
                <span className="lp-trust-check inline-flex w-4 shrink-0 justify-center">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
