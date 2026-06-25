"use client";

import Link from "next/link";
import { useState } from "react";
import NetflixEmailForm from "@/components/home/netflix/NetflixEmailForm";
import SiteFooter from "@/components/layout/SiteFooter";
import {
  getHeroPosterTiles,
  getTrendingLandingStories,
  NETFLIX_HOME_FAQ,
  NETFLIX_HOME_FEATURES,
} from "@/lib/home/netflixLandingData";
import type { MockCatalogStory } from "@/lib/mock/businessStoryCatalog";
import { NAVY_COVER_GRADIENT } from "@/lib/theme/navy";

function FeatureIcon({ type }: { type: string }) {
  const className = "h-10 w-10 text-[#2F80ED]";
  switch (type) {
    case "tv":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 19v2" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "devices":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4" width="14" height="16" rx="2" />
          <path d="M18 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-2" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17.8l-6.2 4.5 2.4-7.4L2 10.4h7.6L12 3z" />
        </svg>
      );
  }
}

function PosterTile({ story }: { story: MockCatalogStory }) {
  if (story.coverArtUrl) {
    return (
      <img
        src={story.coverArtUrl}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-end bg-gradient-to-br ${NAVY_COVER_GRADIENT} p-2`}
    >
      <span className="line-clamp-3 text-[10px] font-bold leading-tight text-white/90">
        {story.title}
      </span>
    </div>
  );
}

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl border border-[#E7DDCC] bg-[#FFFDF7] px-5 py-4 text-left text-base font-semibold text-[#0E1726] transition hover:bg-[#FBF6EE] sm:px-6 sm:py-5 sm:text-lg"
      >
        {question}
        <span className="ml-4 shrink-0 text-2xl font-light leading-none text-[#64748B]">
          {open ? "×" : "+"}
        </span>
      </button>
      {open ? (
        <div className="rounded-b-xl border border-t-0 border-[#E7DDCC] bg-[#FFFDF7] px-5 pb-5 pt-1 text-sm leading-relaxed text-[#64748B] sm:px-6 sm:text-base">
          {answer}
        </div>
      ) : null}
    </div>
  );
}

export default function NetflixHomeLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroTiles = getHeroPosterTiles();
  const trending = getTrendingLandingStories();

  return (
    <div className="min-h-[100dvh] bg-[#F6F1E7] text-[#0E1726]">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E7DDCC] bg-[#F6F1E7]/95 px-4 py-3.5 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between">
          <Link
            href="/home"
            className="font-heading text-xl font-extrabold tracking-tight text-[#2F80ED] md:text-2xl"
          >
            Toonlora
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-semibold text-[#64748B] transition hover:text-[#2F80ED] sm:inline"
            >
              Browse stories
            </Link>
            <Link
              href="/signin"
              className="rounded-full bg-[#2F80ED] px-4 py-1.5 text-sm font-bold text-white transition hover:bg-[#1F6FD6]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#F6F1E7] pt-[4.5rem]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-[38%] grid w-[110%] max-w-[900px] grid-cols-5 gap-2 opacity-[0.22] sm:grid-cols-6 sm:gap-2.5"
            style={{
              transform: "translate(-50%, -50%) perspective(800px) rotateX(10deg) rotateZ(-3deg) scale(0.95)",
            }}
          >
            {heroTiles.slice(0, 12).map((story, index) => (
              <div
                key={`${story.id}-${index}`}
                className="aspect-[2/3] overflow-hidden rounded-md ring-1 ring-[#E7DDCC]"
              >
                <PosterTile story={story} />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#F6F1E7]/30 via-[#F6F1E7]/85 to-[#F6F1E7]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[720px] px-4 py-12 text-center md:px-6 md:py-14">
          <h1 className="font-heading text-[1.75rem] font-extrabold leading-[1.12] tracking-tight text-[#0E1726] sm:text-3xl md:text-[2.125rem]">
            The world&apos;s most fascinating business stories, told as cinematic comics.
          </h1>
          <p className="mt-3 text-base font-medium text-[#64748B] md:text-lg">
            Read for free.
          </p>
          <p className="mt-5 text-sm text-[#0E1726] md:text-base">
            Ready to read? Enter your email and create your Free account.
          </p>
          <div className="mt-4 flex justify-center">
            <NetflixEmailForm variant="light" />
          </div>
          <p className="mt-3 text-xs text-[#64748B] md:text-sm">
            Chapter 1 free on every story · 1 extra chapter/week after signup
          </p>
        </div>
      </section>

      {/* Trending */}
      <section className="relative z-10 border-t border-[#E7DDCC] bg-[#F6F1E7] px-4 pb-16 pt-10 md:px-8">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-4 font-heading text-xl font-extrabold text-[#0E1726] md:text-2xl">
            Trending
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trending.map((story, index) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="group relative flex shrink-0 items-end"
              >
                <span
                  className="pointer-events-none absolute -left-1 bottom-0 z-0 select-none font-black leading-none text-[#E7DDCC]"
                  style={{
                    fontSize: "clamp(3.5rem, 10vw, 5.5rem)",
                    opacity: 0.55,
                  }}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="relative z-10 w-[112px] overflow-hidden rounded-lg border border-[#E7DDCC] bg-[#FFFDF7] shadow-[0_2px_10px_rgba(14,23,38,0.06)] transition group-hover:scale-[1.03] sm:w-[130px] md:w-[148px]">
                  <div className="aspect-[2/3]">
                    <PosterTile story={story} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07111F]/90 to-transparent p-2 pt-8">
                    <p className="line-clamp-2 text-xs font-bold text-[#F8FAFC]">
                      {story.title}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#E7DDCC] bg-[#F6F1E7] px-4 py-14 md:px-8">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="mb-6 font-heading text-xl font-extrabold text-[#0E1726] md:text-2xl">
            More reasons to join
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NETFLIX_HOME_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="relative overflow-hidden rounded-2xl border border-[#E7DDCC] bg-[#FFFDF7] p-5 shadow-[0_2px_12px_rgba(14,23,38,0.05)]"
              >
                <h3 className="font-heading text-lg font-extrabold text-[#0E1726]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                  {feature.description}
                </p>
                <div className="absolute bottom-4 right-4 opacity-80">
                  <FeatureIcon type={feature.icon} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[#E7DDCC] bg-[#F6F1E7] px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center font-heading text-2xl font-extrabold text-[#0E1726] md:text-left">
            Frequently asked questions
          </h2>
          {NETFLIX_HOME_FAQ.map((item, index) => (
            <FaqItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              open={openFaq === index}
              onToggle={() =>
                setOpenFaq((current) => (current === index ? null : index))
              }
            />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#E7DDCC] bg-[#F6F1E7] px-4 py-14 md:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="text-base text-[#0E1726] md:text-lg">
            Ready to read? Enter your email and create your Free account.
          </p>
          <div className="mt-5 w-full">
            <NetflixEmailForm variant="light" />
          </div>
          <p className="mt-3 text-xs text-[#64748B]">
            Chapter 1 free on every story · 1 extra chapter/week after signup
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
