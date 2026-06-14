"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BRAND_HEADLINE,
  BRAND_SUBHEADLINE,
  BRAND_TAGLINE,
  CREDIT_COPY,
} from "@/lib/brand";

const TRUST_ITEMS = [
  "Free to read",
  "New episodes weekly",
  "First story free",
  "Create with credits",
] as const;

export default function HomeHero() {
  return (
    <>
      <section className="relative overflow-x-clip">
        {/* Premium gradient background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#5340FF] via-[#6D4CFF] to-[#2A114B]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#8B7CFF]/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-[#FF6847]/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#FFE033]/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(255,255,255,0.12),transparent_55%)]"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[1280px] px-6 py-10 sm:py-12 lg:max-h-[720px] lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            {/* Left — copy */}
            <div className="min-w-0 text-center lg:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85 sm:text-xs">
                {BRAND_TAGLINE.toUpperCase()}
              </p>

              <h1 className="font-heading mt-4 text-[2.375rem] font-bold leading-[1.06] tracking-tight text-white sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] xl:text-[4.75rem]">
                {BRAND_HEADLINE}
              </h1>

              <p className="mx-auto mt-4 max-w-[620px] text-base leading-relaxed text-white/88 sm:text-lg lg:mx-0">
                {BRAND_SUBHEADLINE}
              </p>

              <div className="mx-auto mt-8 flex max-w-[620px] flex-col gap-3 sm:flex-row sm:items-center lg:mx-0">
                <Link
                  href="/#rankings"
                  className="btn-coral inline-flex h-14 min-w-[180px] flex-1 items-center justify-center rounded-full px-8 text-base font-extrabold shadow-[0_10px_28px_rgba(255,104,71,0.35)] sm:flex-none"
                >
                  Start reading
                </Link>
                <Link
                  href="/create"
                  className="inline-flex h-14 min-w-[180px] flex-1 items-center justify-center rounded-full bg-lp-yellow px-8 text-base font-extrabold text-lp-purple-deep shadow-[0_10px_28px_rgba(255,224,51,0.3)] transition hover:brightness-105 active:scale-[0.98] sm:flex-none"
                >
                  Create a story
                </Link>
              </div>

              <p className="mx-auto mt-4 max-w-[620px] text-sm text-white/70 lg:mx-0">
                {CREDIT_COPY}
              </p>
            </div>

            {/* Right — integrated visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-[480px] lg:max-w-[540px] lg:justify-self-end"
            >
              <div className="relative overflow-hidden rounded-[32px] shadow-[0_28px_64px_rgba(42,17,75,0.35)] ring-1 ring-white/20">
                <div
                  className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#2A114B]/25 via-transparent to-white/5"
                  aria-hidden
                />
                <Image
                  src="/images/hero-toonlora.png"
                  alt="Read and create cartoon stories on Toonlora"
                  width={1024}
                  height={1024}
                  priority
                  className="aspect-[4/5] w-full object-cover object-center sm:aspect-[5/6]"
                />
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-1 top-6 z-20 rounded-2xl bg-white/95 px-3 py-2 shadow-[0_8px_24px_rgba(42,17,75,0.18)] ring-1 ring-white/60 sm:-left-4 sm:top-8 sm:px-4 sm:py-2.5"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-lp-purple sm:text-[11px]">
                  New Episode
                </p>
                <p className="font-heading text-sm font-bold text-lp-purple-deep sm:text-base">
                  01 ▶
                </p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -right-1 bottom-10 z-20 rounded-full bg-lp-coral px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_8px_20px_rgba(255,104,71,0.4)] sm:-right-3 sm:bottom-14 sm:px-4 sm:py-2 sm:text-xs"
              >
                Free to read ✦
              </motion.div>

              <div
                className="pointer-events-none absolute -inset-4 -z-10 rounded-[40px] bg-[#5340FF]/40 blur-2xl"
                aria-hidden
              />
            </motion.div>
          </div>
        </div>

        {/* Curved wave into white section */}
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

      {/* Trust strip */}
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
