"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useAffiliateHref } from "@/lib/affiliate/useAffiliateSlug";

type AffiliateLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/** Internal link — affiliate attribution is stored silently, not added to URLs. */
export default function AffiliateLink({ href, ...props }: AffiliateLinkProps) {
  const affHref = useAffiliateHref(href);
  return <Link href={affHref} {...props} />;
}
