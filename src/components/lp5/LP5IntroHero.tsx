"use client";

import { useEffect, useRef } from "react";
import LP3LegalFooter from "@/components/lp3/LP3LegalFooter";
import LpStoryTeaserIntro from "@/components/lp/LpStoryTeaserIntro";
import type { Lp5IntroCopy } from "@/lib/lp5/useLp5IntroCopy";
import type { LpStoryOption } from "@/lib/lp3/storyOptions";

interface LP5IntroHeroProps {
  copy: Lp5IntroCopy;
  story: LpStoryOption;
  onStart: () => void;
  ctaButton: React.ComponentType<{
    onClick: () => void;
    children: React.ReactNode;
  }>;
  onInlineCtaVisibleChange?: (visible: boolean) => void;
}

function LP5InlineCta({
  copy,
  onStart,
  CtaButton,
  ctaRef,
}: {
  copy: Lp5IntroCopy;
  onStart: () => void;
  CtaButton: LP5IntroHeroProps["ctaButton"];
  ctaRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={ctaRef} className="mt-6">
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#2F80ED]">
        {copy.chapterUnlocked}
      </p>
      <div className="mt-2">
        <CtaButton onClick={onStart}>{copy.cta}</CtaButton>
      </div>
      <p className="mt-2.5 text-center text-[11px] leading-snug text-[#64748B]">
        {copy.riskReversal}
      </p>
      <div className="mt-4">
        <LP3LegalFooter />
      </div>
    </div>
  );
}

export default function LP5IntroHero({
  copy,
  story,
  onStart,
  ctaButton: CtaButton,
  onInlineCtaVisibleChange,
}: LP5IntroHeroProps) {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el || !onInlineCtaVisibleChange) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        onInlineCtaVisibleChange(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.35, rootMargin: "0px 0px -72px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onInlineCtaVisibleChange]);

  return (
    <LpStoryTeaserIntro
      teaser={copy}
      story={story}
      className="pb-6 pt-4 sm:pt-5"
    >
      <LP5InlineCta
        copy={copy}
        onStart={onStart}
        CtaButton={CtaButton}
        ctaRef={ctaRef}
      />
    </LpStoryTeaserIntro>
  );
}
