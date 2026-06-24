"use client";

import Link from "next/link";
import CoverArt from "@/components/ui/CoverArt";
import { CREATOR_CTA, CREDIT_COPY } from "@/lib/brand";

interface CreatorCTACardProps {
  embedded?: boolean;
}

export default function CreatorCTACard({ embedded = false }: CreatorCTACardProps) {
  const shell = embedded
    ? "overflow-hidden rounded-[20px] border border-[#E7D8FF] bg-[#F3ECFF]/50 shadow-[0_8px_32px_rgba(83,64,255,0.08)]"
    : "card-shadow overflow-hidden rounded-[20px] border border-[#E7D8FF] bg-white";

  return (
    <section className={embedded ? "" : "py-12 md:py-[72px]"}>
      <div className={embedded ? "" : "mx-auto max-w-[1280px] px-4 sm:px-6"}>
        <div className={shell}>
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#5340FF]">
                For creators
              </p>
              <h2 className="font-heading mt-2 text-xl font-extrabold text-[#101828] sm:text-2xl">
                Turn business stories into cartoons
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#667085]">
                {CREATOR_CTA} {CREDIT_COPY}
              </p>
              <Link
                href="/create"
                className="btn-coral mt-6 w-full py-3.5 text-sm font-bold sm:w-fit sm:px-8"
              >
                Create a story
              </Link>
            </div>

            <div className="relative flex h-36 items-end justify-center gap-2 overflow-hidden bg-gradient-to-br from-white to-[#F3ECFF] px-4 pb-4 sm:h-auto sm:w-[240px] sm:justify-end sm:px-5 sm:pb-5">
              <CoverArt
                gradient="from-[#5340FF] via-[#7C3AED] to-[#8B5CF6]"
                genre="Fantasy"
                title="Your story"
                className="h-28 w-[4.5rem] -rotate-6 rounded-[14px] sm:h-32 sm:w-24"
              />
              <CoverArt
                gradient="from-[#6D4CFF] via-[#5340FF] to-[#22D3EE]"
                genre="Adventure"
                className="h-24 w-[4rem] rotate-4 rounded-[14px] sm:h-28 sm:w-20"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
