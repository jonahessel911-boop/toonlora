"use client";

import Link from "next/link";
import { ACHIEVER_PLAN } from "@/lib/payments/subscription-plans";
import { TIER_BENEFITS } from "@/lib/payments/reading-benefits";
import {
  buildAuthHref,
  buildPaywallPath,
  buildReaderSignupPath,
} from "@/lib/reader/nextEpisodeGate";
import {
  appendAffiliateToHref,
  getAffiliateSlugForLinks,
} from "@/lib/affiliate/client-tracking";

const CREAM = "#F6F1E7";
const CARD = "#FFFDF7";
const BORDER = "#E7DDCC";
const TEXT = "#0E1726";
const MUTED = "#64748B";
const BLUE = "#2F80ED";

export type EpisodePreviewGateMode = "signup" | "upgrade" | "upgrade_weekly";

interface EpisodePreviewGateProps {
  mode: EpisodePreviewGateMode;
  seriesId: string;
  seriesTitle: string;
  episodeNumber: number;
}

const UPGRADE_BENEFITS_NL = [
  "Onbeperkt lezen",
  "Elke week een nieuwe episode voor alle stories",
  "Lees reclamevrij op telefoon, tablet en desktop",
  "Bewaar je bibliotheek en leesvoortgang",
] as const;

export default function EpisodePreviewGate({
  mode,
  seriesId,
  seriesTitle,
  episodeNumber,
}: EpisodePreviewGateProps) {
  const affiliate = getAffiliateSlugForLinks();
  const returnTo = `/story/${seriesId}/read?ep=${episodeNumber}`;
  const signupHref = appendAffiliateToHref(
    buildReaderSignupPath(seriesId, seriesTitle, episodeNumber - 1),
    affiliate
  );
  const registerHref = appendAffiliateToHref(
    buildAuthHref("/signup/register", returnTo, affiliate),
    affiliate
  );
  const signinHref = appendAffiliateToHref(
    buildAuthHref("/signin", returnTo, affiliate),
    affiliate
  );
  const subscribeHref = appendAffiliateToHref(
    buildPaywallPath(seriesId, episodeNumber, seriesTitle, {
      reason: mode === "upgrade_weekly" ? "weekly_limit" : undefined,
    }),
    affiliate
  );

  if (mode === "signup") {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <h2
          className="font-heading text-[1.65rem] font-extrabold leading-tight tracking-tight sm:text-[1.85rem]"
          style={{ color: TEXT }}
        >
          Create an account to read the full story
        </h2>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
          Chapter 1 is free. Sign up for a free account to unlock one extra
          chapter per week — or upgrade for unlimited reading.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={signupHref}
            className="inline-flex h-12 w-full items-center justify-center rounded-full border text-sm font-bold transition hover:bg-white"
            style={{ borderColor: TEXT, color: TEXT, background: CARD }}
          >
            Continue with email
          </Link>
          <Link
            href={registerHref}
            className="inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-bold text-white transition hover:opacity-95"
            style={{ background: BLUE }}
          >
            Create free account
          </Link>
        </div>

        <p className="mt-5 text-sm" style={{ color: MUTED }}>
          Already have an account?{" "}
          <Link
            href={signinHref}
            className="font-semibold underline underline-offset-2"
            style={{ color: TEXT }}
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  const weeklyNote =
    mode === "upgrade_weekly"
      ? "Je gratis hoofdstuk van deze week is gebruikt."
      : null;

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{ background: CARD, border: `1px solid ${BORDER}` }}
      >
        <h2
          className="font-heading text-xl font-extrabold leading-snug tracking-tight sm:text-2xl"
          style={{ color: TEXT }}
        >
          Upgrade je abonnement om verder te lezen
        </h2>
        <p className="mt-2 text-sm" style={{ color: MUTED }}>
          Vanaf{" "}
          <span className="font-bold" style={{ color: TEXT }}>
            {ACHIEVER_PLAN.priceLabel}
          </span>{" "}
          per maand
        </p>
        {weeklyNote ? (
          <p className="mt-2 text-xs font-medium" style={{ color: MUTED }}>
            {weeklyNote}
          </p>
        ) : null}

        <ul className="mt-5 space-y-2.5 text-left">
          {UPGRADE_BENEFITS_NL.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-2.5 text-sm"
              style={{ color: TEXT }}
            >
              <span
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: BLUE }}
              >
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <Link
          href={subscribeHref}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-bold text-white transition hover:opacity-95"
          style={{ background: BLUE }}
        >
          Upgrade nu
        </Link>

        <p className="mt-3 text-center text-xs" style={{ color: MUTED }}>
          Plus-plan · {TIER_BENEFITS.achiever[0].toLowerCase()}
        </p>
      </div>
    </div>
  );
}

/** Gradient fade + gate shell integrated over clipped panel content. */
export function EpisodePreviewGateShell({
  children,
  mode,
  seriesId,
  seriesTitle,
  episodeNumber,
}: EpisodePreviewGateProps & { children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none max-h-[min(52vh,520px)] overflow-hidden">
        {children}
      </div>

      <div className="absolute inset-x-0 bottom-0">
        <div
          className="h-28 w-full sm:h-36"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, rgba(8,4,15,0.55) 35%, ${CREAM} 100%)`,
          }}
        />
        <div className="px-4 pb-10 pt-2 sm:px-6" style={{ background: CREAM }}>
          <EpisodePreviewGate
            mode={mode}
            seriesId={seriesId}
            seriesTitle={seriesTitle}
            episodeNumber={episodeNumber}
          />
        </div>
      </div>
    </div>
  );
}
