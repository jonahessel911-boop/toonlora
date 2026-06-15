"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroFeaturedStories from "@/components/home/HeroFeaturedStories";
import { useCatalog } from "@/hooks/useCatalog";

const TRUST_ITEMS = [
  "Free to read",
  "New episodes weekly",
  "Episode 1 always free",
  "Create when you're ready",
] as const;

export default function HomeHero() {
  const { series: featured } = useCatalog({ sort: "featured", limit: 4 });

  return (
    <>
      <section className="relative overflow-hidden">
        {/* Premium gradient + depth */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#5340FF] via-[#6D4CFF] to-[#2A114B]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-soft-light"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.2), transparent 42%), radial-gradient(circle at 85% 25%, rgba(255,104,71,0.15), transparent 38%), radial-gradient(circle at 50% 100%, rgba(42,17,75,0.5), transparent 55%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#8B7CFF]/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-10 right-0 h-80 w-80 rounded-full bg-[#FF4FA3]/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[1360px] px-5 py-12 sm:px-6 sm:py-14 lg:py-16">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-8 xl:gap-12">
            {/* Left — 48% */}
            <div className="w-full min-w-0 text-center lg:w-[48%] lg:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/90 sm:text-[11px] sm:tracking-[0.18em]">
                Read for free. Create when you&apos;re ready.
              </p>

              <h1 className="font-heading mt-4 text-[2rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[2.5rem] md:text-[2.875rem] lg:text-[3.125rem] xl:text-[3.375rem]">
                Start reading cartoon stories for free.{" "}
                <span className="text-white/92">
                  Create your own when you&apos;re ready.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-[480px] text-[15px] leading-relaxed text-white/88 sm:text-base lg:mx-0 lg:max-w-[520px]">
                Explore community-made episodes, follow your favorite stories, and
                turn your own ideas into cartoon episodes later.
              </p>

              <div className="mx-auto mt-8 flex max-w-[480px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-center lg:mx-0 lg:justify-start">
                <Link
                  href="#rankings"
                  className="btn-coral min-h-[52px] w-full px-8 text-base font-extrabold sm:w-auto sm:min-w-[196px]"
                >
                  Start reading
                </Link>
                <Link
                  href="/create"
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white/30 bg-white/8 px-8 text-base font-semibold text-white/95 backdrop-blur-sm transition hover:border-white/45 hover:bg-white/12 active:scale-[0.98] sm:w-auto sm:min-w-[196px]"
                >
                  Create a story
                </Link>
              </div>

              <p className="mx-auto mt-4 max-w-[480px] text-sm text-white/60 lg:mx-0">
                Episode 1 is free. Creating stories uses credits.
              </p>
            </div>

            {/* Right — 52% */}
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

        <div className="relative h-10 w-full sm:h-14" aria-hidden>
          <svg
            viewBox="0 0 1440 56"
            preserveAspectRatio="none"
            className="absolute bottom-0 h-full w-full text-white"
          >
            <path
              fill="currentColor"
              d="M0,32 C360,56 720,8 1080,28 C1260,40 1380,48 1440,40 L1440,56 L0,56 Z"
            />
          </svg>
        </div>
      </section>

      <section className="border-b border-border bg-white py-5 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-8">
            {TRUST_ITEMS.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-2 text-xs font-semibold text-gs-muted sm:text-sm"
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
