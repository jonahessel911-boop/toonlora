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

const TRUST_BADGES = [
  { label: "Free to read", accent: "text-primary" },
  { label: "New episodes weekly", accent: "text-accent-pink" },
  { label: "First story free", accent: "text-accent-cyan" },
  { label: "Create with credits", accent: "text-primary-dark" },
] as const;

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[#FCFAFF]">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary-soft/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-1/3 h-64 w-64 rounded-full bg-accent-pink/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-accent-cyan/5 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-14">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <p className="font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-primary sm:text-xs">
            {BRAND_TAGLINE.toUpperCase()}
          </p>

          <h1 className="font-heading mt-4 text-[2rem] font-bold leading-[1.08] tracking-tight text-gs-text sm:text-5xl lg:text-[3.25rem]">
            {BRAND_HEADLINE}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gs-muted sm:text-lg lg:mx-0">
            {BRAND_SUBHEADLINE}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/#rankings"
              className="flex min-h-[50px] items-center justify-center rounded-full bg-primary-dark px-8 text-sm font-bold text-white shadow-[0_4px_20px_rgba(42,17,75,0.25)] transition hover:opacity-95 active:scale-[0.98]"
            >
              Start reading
            </Link>
            <Link
              href="/create"
              className="flex min-h-[50px] items-center justify-center rounded-full border-2 border-border bg-white px-8 text-sm font-bold text-primary-dark transition hover:bg-surface-soft active:scale-[0.98]"
            >
              Create a story
            </Link>
          </div>

          <p className="mt-3 text-xs text-gs-muted sm:text-sm">{CREDIT_COPY}</p>

          <ul className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {TRUST_BADGES.map((badge) => (
              <li
                key={badge.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-gs-text shadow-sm sm:text-xs"
              >
                <span className={`font-bold ${badge.accent}`}>✦</span>
                {badge.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Hero illustration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[480px] lg:max-w-none lg:justify-self-end"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="pointer-events-none absolute inset-4 rounded-[2rem] bg-gradient-to-br from-primary-soft/50 via-transparent to-accent-pink/10 blur-sm" />
            <Image
              src="/images/hero-toonlora.png"
              alt="Read cartoon stories and create your own on Toonlora"
              width={800}
              height={800}
              priority
              className="relative h-auto w-full object-contain drop-shadow-[0_20px_50px_rgba(124,58,237,0.15)]"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
