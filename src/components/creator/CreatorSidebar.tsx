"use client";

import Link from "next/link";
import ToonloraLogo from "@/components/ui/ToonloraLogo";
import CreditsBadge from "@/components/creator/CreditsBadge";
import type { StudioSection } from "@/types/creator";

const NAV: { id: StudioSection; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "◆" },
  { id: "stories", label: "Stories", icon: "▤" },
  { id: "characters", label: "Characters", icon: "◎" },
  { id: "editor", label: "Panel editor", icon: "▣" },
  { id: "covers", label: "Covers", icon: "▦" },
  { id: "published", label: "Published", icon: "✦" },
  { id: "community", label: "Community characters", icon: "☆" },
  { id: "analytics", label: "Analytics", icon: "↗" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

interface CreatorSidebarProps {
  active: StudioSection;
  onNavigate: (section: StudioSection) => void;
  mobile?: boolean;
  onClose?: () => void;
}

export default function CreatorSidebar({
  active,
  onNavigate,
  mobile,
  onClose,
}: CreatorSidebarProps) {
  return (
    <aside
      className={`flex h-full flex-col border-r border-[#E7D8FF] bg-white ${
        mobile ? "w-full" : "w-[240px] shrink-0"
      }`}
    >
      <div className="flex items-center justify-between border-b border-[#E7D8FF] px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <ToonloraLogo className="h-7 w-auto" />
        </Link>
        {mobile && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#667085] hover:bg-[#F3ECFF]"
            aria-label="Close menu"
          >
            ✕
          </button>
        ) : null}
      </div>

      <div className="px-3 py-3">
        <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-[#667085]">
          Studio
        </p>
        <p className="px-2 font-heading text-sm font-extrabold text-[#2A114B]">
          Toonlora Studio
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                onClose?.();
              }}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                isActive
                  ? "bg-[#5340FF] text-white shadow-[0_4px_14px_rgba(83,64,255,0.35)]"
                  : "text-[#667085] hover:bg-[#F3ECFF] hover:text-[#2A114B]"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs ${
                  isActive ? "bg-white/20" : "bg-[#F3ECFF] text-[#5340FF]"
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#E7D8FF] p-4">
        <CreditsBadge />
      </div>
    </aside>
  );
}
