"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function LP3MoneyBackGuarantee() {
  const t = useTranslations("paywall");

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3">
        <Image
          src="/images/money-back-guarantee.png"
          alt=""
          width={72}
          height={72}
          className="h-16 w-16 shrink-0 object-contain"
        />
        <p className="text-sm font-bold leading-snug text-[#0A1628]">
          {t("moneyBackTitle")}
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
        {t("moneyBackBody")}
      </p>
    </div>
  );
}
