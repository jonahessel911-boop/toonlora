"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LP3_MEMBERSHIP_INCLUDES_PREVIEW_COUNT } from "@/lib/lp3/content";

export default function LP3MembershipIncludes() {
  const t = useTranslations("paywall");
  const [expanded, setExpanded] = useState(false);
  const items = t.raw("membershipIncludes") as string[];
  const preview = items.slice(0, LP3_MEMBERSHIP_INCLUDES_PREVIEW_COUNT);
  const rest = items.slice(LP3_MEMBERSHIP_INCLUDES_PREVIEW_COUNT);
  const hiddenCount = rest.length;

  return (
    <div className="mt-5 rounded-xl border border-[#2F80ED]/25 bg-white p-4 shadow-sm">
      <p className="text-center text-xs font-bold uppercase tracking-[0.12em] text-[#2F80ED]">
        {t("includedInEveryPlan")}
      </p>
      <ul className="mt-3 space-y-2">
        {(expanded ? items : preview).map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm font-medium leading-snug text-[#0A1628]"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00B67A] text-[11px] font-bold text-white">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full text-center text-sm font-bold text-[#2F80ED]"
        >
          {expanded ? t("showLess") : t("moreCount", { count: hiddenCount })}
        </button>
      ) : null}
    </div>
  );
}
