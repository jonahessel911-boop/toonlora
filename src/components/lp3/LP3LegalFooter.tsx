"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function LP3LegalFooter({ className = "" }: { className?: string }) {
  const t = useTranslations("paywall");

  return (
    <p className={`text-center text-[11px] leading-relaxed text-[#64748B] ${className}`}>
      {t("legalPrefix")}{" "}
      <Link href="/signup/register" className="font-semibold text-[#2F80ED] underline">
        {t("termsOfUse")}
      </Link>{" "}
      {t("legalAnd")}{" "}
      <Link href="/signup/register" className="font-semibold text-[#2F80ED] underline">
        {t("privacyPolicy")}
      </Link>
      .
    </p>
  );
}
