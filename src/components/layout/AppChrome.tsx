"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ToonloraLogo from "@/components/ui/ToonloraLogo";
import { useCreditsStore } from "@/store/useCreditsStore";
import { useEffect } from "react";

const tabs = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/create", label: "Create", icon: "✨" },
  { href: "/library", label: "Library", icon: "📚" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { credits, hydrate } = useCreditsStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 transition ${
                active ? "text-groen-primary" : "text-gray-400"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-bold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppHeader({ showCredits = true }: { showCredits?: boolean }) {
  const { credits, hydrate } = useCreditsStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <Link href="/" className="flex items-center gap-1">
        <ToonloraLogo variant="compact" iconSize={24} />
      </Link>
      <div className="flex items-center gap-2">
        {showCredits && (
          <Link
            href="/library"
            className="flex items-center gap-1.5 rounded-full bg-groen-mint px-3 py-1.5 text-xs font-bold text-groen-deep"
          >
            ✦ {credits}
          </Link>
        )}
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-600 text-sm text-white shadow-md"
        >
          L
        </Link>
      </div>
    </header>
  );
}
