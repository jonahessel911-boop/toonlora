"use client";

import Link from "next/link";
import AffiliateLink from "@/components/affiliate/AffiliateLink";

export type ProfileTab = "overview" | "subscription" | "account";

const TABS: { id: ProfileTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "subscription", label: "Subscription", icon: "◆" },
  { id: "account", label: "Account", icon: "◎" },
];

interface ProfileSidebarProps {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

export default function ProfileSidebar({
  active,
  onChange,
}: ProfileSidebarProps) {
  return (
    <aside className="md:w-52 md:shrink-0">
      <AffiliateLink
        href="/"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] transition hover:text-[#2F80ED]"
      >
        <span aria-hidden>←</span>
        Back to Toonlora
      </AffiliateLink>

      <nav className="flex gap-1 overflow-x-auto border-b border-[#E7DDCC] pb-3 md:flex-col md:gap-0 md:border-b-0 md:pb-0">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition md:w-full md:px-3 md:py-3 ${
                isActive
                  ? "bg-[#FFFDF7] text-[#0E1726] shadow-[0_1px_8px_rgba(14,23,38,0.06)] ring-1 ring-[#E7DDCC]"
                  : "text-[#64748B] hover:bg-[#FFFDF7]/60 hover:text-[#0E1726]"
              }`}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs"
                style={{
                  background: isActive ? "rgba(47,128,237,0.1)" : "transparent",
                  color: isActive ? "#2F80ED" : "#64748B",
                }}
                aria-hidden
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function profileTabHref(tab: ProfileTab): string {
  return tab === "overview" ? "/profile" : `/profile?tab=${tab}`;
}

export function ProfileTabLink({
  tab,
  children,
  className = "",
}: {
  tab: ProfileTab;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={profileTabHref(tab)} className={className}>
      {children}
    </Link>
  );
}
