"use client";

import Link from "next/link";
import CoverArt from "@/components/ui/CoverArt";
import { CREATOR_CTA, CREDIT_COPY } from "@/lib/brand";

export default function CreatorCTACard() {
  return (
    <section className="py-5 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="card-shadow overflow-hidden rounded-[20px] border border-gs-border bg-gs-surface-mint">
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-1 flex-col justify-center px-5 py-6 sm:px-10 sm:py-10">
              <h2 className="font-heading text-lg font-bold text-gs-text sm:text-2xl">
                Want to make your own?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gs-muted">
                {CREATOR_CTA} {CREDIT_COPY}
              </p>
              <Link
                href="/create"
                className="mt-5 flex w-full items-center justify-center rounded-full bg-gs-primary-dark py-3.5 text-sm font-bold text-white shadow-md transition active:scale-[0.98] sm:mt-6 sm:w-fit sm:px-7"
              >
                Create a story
              </Link>
            </div>

            <div className="relative flex h-36 items-end justify-center gap-2 overflow-hidden bg-gradient-to-br from-gs-primary-soft/80 to-white px-4 pb-3 sm:h-auto sm:w-[260px] sm:justify-end sm:px-5 sm:pb-5">
              <CoverArt
                gradient="from-[#7C3AED] via-[#8B5CF6] to-[#FF4FA3]"
                genre="Fantasy"
                title="Your story"
                className="h-28 w-[4.5rem] -rotate-6 rounded-xl sm:h-32 sm:w-24"
              />
              <CoverArt
                gradient="from-[#FFD84D] via-[#FBBF24] to-[#FF4FA3]"
                genre="Comedy"
                className="h-24 w-[4rem] rotate-4 rounded-xl sm:h-28 sm:w-20"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
