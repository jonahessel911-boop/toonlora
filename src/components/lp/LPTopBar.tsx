"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ToonloraLogo from "@/components/ui/ToonloraLogo";
import { useUserStore } from "@/store/useUserStore";
import { useCreditsStore } from "@/store/useCreditsStore";

interface LPTopBarProps {
  onRead?: () => void;
}

export default function LPTopBar({ onRead }: LPTopBarProps) {
  const { email, fullName } = useUserStore();
  const { credits, hydrate } = useCreditsStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const loggedIn = Boolean(email);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const initial = (fullName || email || "U").charAt(0).toUpperCase();

  const menuItems = [
    { label: "Read", href: "#", action: onRead },
    { label: "Create", href: "/create" },
    { label: "My Studio", href: "/creator" },
    { label: "Settings", href: "/signup/register" },
  ];

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pt-3 sm:pt-4">
      <header className="lp-nav-pill flex h-[3.25rem] items-center justify-between px-4 sm:px-5">
        <Link href="/lp/1" className="flex min-w-0 items-center gap-2">
          <ToonloraLogo variant="compact" iconSize={28} />
        </Link>

        {loggedIn ? (
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="hidden rounded-full bg-lp-yellow px-2.5 py-1 text-[11px] font-bold text-lp-purple-deep sm:inline">
              {credits}
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-lp-purple text-xs font-bold text-white"
                aria-label="Menu"
              >
                {initial}
              </button>
              {menuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl bg-white py-1 shadow-2xl ring-1 ring-gray-100">
                    {menuItems.map((item) =>
                      item.action ? (
                        <button
                          key={item.label}
                          type="button"
                          className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-lp-purple/5"
                          onClick={() => {
                            item.action?.();
                            setMenuOpen(false);
                          }}
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-lp-purple/5"
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <Link
            href="/signin"
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Log in
          </Link>
        )}
      </header>
    </div>
  );
}
