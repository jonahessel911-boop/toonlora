"use client";

import Link from "next/link";
import { useState } from "react";
import NetflixEmailForm from "@/components/home/netflix/NetflixEmailForm";
import { ACHIEVER_PLAN, formatEur } from "@/lib/payments/subscription-plans";
import {
  getHeroPosterTiles,
  getTrendingLandingStories,
  NETFLIX_HOME_FAQ,
  NETFLIX_HOME_FEATURES,
} from "@/lib/home/netflixLandingData";
import type { MockCatalogStory } from "@/lib/mock/businessStoryCatalog";
import { NAVY_COVER_GRADIENT } from "@/lib/theme/navy";

function FeatureIcon({ type }: { type: string }) {
  const className = "h-10 w-10 text-accent";
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
        className="flex w-full items-center justify-between bg-[#2d2d2d] px-6 py-6 text-left text-lg font-medium text-white transition hover:bg-[#414141]"
      >
        {question}
        <span className="text-3xl font-light leading-none text-white">
          {open ? "×" : "+"}
        </span>
      </button>
      {open ? (
        <div className="bg-[#2d2d2d] px-6 pb-6 text-base leading-relaxed text-white/90">
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
    <div className="min-h-[100dvh] bg-black text-white">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-black/80 to-transparent px-4 py-4 md:px-12">
        <div className="mx-auto flex max-w-[1920px] items-center justify-between">
          <Link
            href="/home"
            className="font-heading text-2xl font-extrabold tracking-tight text-accent md:text-3xl"
          >
            Toonlora
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-medium text-white/80 hover:text-white sm:inline"
            >
              Browse stories
            </Link>
            <Link
              href="/signin"
              className="rounded bg-accent px-4 py-1.5 text-sm font-bold text-white hover:bg-accent-hover"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-[42%] grid w-[140%] max-w-none grid-cols-4 gap-2 opacity-50 sm:grid-cols-6 sm:gap-3 md:grid-cols-8"
            style={{
              transform: "translate(-50%, -50%) perspective(900px) rotateX(12deg) rotateZ(-4deg) scale(1.15)",
            }}
          >
            {heroTiles.map((story, index) => (
              <div
                key={`${story.id}-${index}`}
                className="aspect-[2/3] overflow-hidden rounded-sm ring-1 ring-white/10"
              >
                <PosterTile story={story} />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-16 text-center md:px-8">
          <h1 className="font-heading text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            Unlimited business stories, cartoons, and more
          </h1>
          <p className="mt-4 text-lg md:text-2xl">
            From {formatEur(ACHIEVER_PLAN.amountCents)}/month. Cancel anytime.
          </p>
          <p className="mt-6 text-base md:text-xl">
            Ready to read? Enter your email to create or restart your membership.
          </p>
          <div className="mt-4 flex justify-center">
            <NetflixEmailForm />
          </div>
          <p className="mt-4 text-sm text-white/60">
            Chapter 1 free on every story · 1 extra chapter/week after signup
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Trending */}
      <section className="relative z-10 -mt-8 bg-black px-4 pb-16 md:px-12">
        <div className="mx-auto max-w-[1920px]">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">Trending</h2>
          <div className="flex gap-3 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trending.map((story, index) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="group relative flex shrink-0 items-end"
              >
                <span
                  className="pointer-events-none absolute -left-1 bottom-0 z-0 select-none font-black leading-none text-[#111] sm:-left-2"
                  style={{
                    fontSize: "clamp(4rem, 12vw, 7rem)",
                    WebkitTextStroke: "2px #333",
                  }}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="relative z-10 w-[120px] overflow-hidden rounded-md ring-1 ring-white/10 transition group-hover:scale-105 sm:w-[150px] md:w-[180px]">
                  <div className="aspect-[2/3]">
                    <PosterTile story={story} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-8">
                    <p className="line-clamp-2 text-xs font-bold">{story.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 bg-black px-4 py-16 md:px-12">
        <div className="mx-auto max-w-[1920px]">
          <h2 className="mb-8 text-center text-2xl font-bold md:text-left md:text-3xl">
            More reasons to join
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NETFLIX_HOME_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6"
              >
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {feature.description}
                </p>
                <div className="absolute bottom-4 right-4 opacity-90">
                  <FeatureIcon type={feature.icon} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-black px-4 py-16 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold md:text-left">
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
      <section className="border-t border-white/10 bg-black px-4 py-16 md:px-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="text-lg md:text-xl">
            Ready to read? Enter your email to create or restart your membership.
          </p>
          <div className="mt-6 w-full">
            <NetflixEmailForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black px-4 py-12 text-sm text-white/50 md:px-12">
        <div className="mx-auto max-w-[1920px]">
          <p className="mb-6">
            Questions?{" "}
            <a href="mailto:hello@toonlora.com" className="underline hover:text-white">
              hello@toonlora.com
            </a>
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["FAQ", "#faq"],
              ["Browse catalog", "/"],
              ["Sign up", "/signup/register"],
              ["Sign in", "/signin"],
              ["Achiever plan", "/subscribe"],
              ["Affiliate program", "/partners/affiliate"],
              ["Terms", "/signup/register"],
              ["Privacy", "/signup/register"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="underline hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="mt-8 text-xs">Toonlora — Business history, told like a series.</p>
        </div>
      </footer>
    </div>
  );
}
