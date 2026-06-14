"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ToonloraLogo from "@/components/ui/ToonloraLogo";
import { useCreditsStore } from "@/store/useCreditsStore";
import { useUserStore } from "@/store/useUserStore";

const browseNav = [
  { href: "/#originals", label: "Originals" },
  { href: "/#categories", label: "Categories" },
  { href: "/#rankings", label: "Rankings" },
  { href: "/#community", label: "Canvas" },
] as const;

const menuLinks: { href: string; label: string; hideWhenLoggedIn?: boolean }[] = [
  { href: "/library", label: "Library" },
  { href: "/create", label: "Create a story" },
  { href: "/signin", label: "Log in", hideWhenLoggedIn: true },
];

function useActiveHash() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return hash;
}

function BrowseTab({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`nav-tab shrink-0 snap-start px-1 pb-3 pt-1 text-[13px] font-bold uppercase tracking-[0.06em] transition-colors sm:text-sm ${
        active ? "nav-tab-active text-primary-dark" : "text-gs-muted hover:text-primary-dark"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const activeHash = useActiveHash();
  const { credits, hydrate } = useCreditsStore();
  const { email } = useUserStore();
  const loggedIn = Boolean(email);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isBrowseActive = (href: string) => {
    const target = href.replace("/", "");
    if (!activeHash && target === "#rankings") return true;
    return activeHash === target;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md">
      {/* Top bar */}
      <div className="border-b border-border/70">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 shrink-0 items-center">
            <ToonloraLogo variant="compact" iconSize={28} />
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {loggedIn && (
              <span className="hidden rounded-full bg-surface-soft px-2.5 py-1 text-xs font-bold text-primary-dark sm:inline">
                {credits} ✦
              </span>
            )}

            {!loggedIn && (
              <Link
                href="/signin"
                className="hidden rounded-full px-3 py-2 text-sm font-semibold text-gs-muted transition hover:text-primary-dark sm:inline-flex"
              >
                Log in
              </Link>
            )}

            <Link
              href="/create"
              className="hidden rounded-full bg-primary-dark px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 sm:inline-flex"
            >
              Create
            </Link>

            <Link
              href="/library"
              className="flex h-10 w-10 items-center justify-center rounded-full text-gs-text transition hover:bg-surface-soft"
              aria-label="Search library"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gs-text transition hover:bg-surface-soft sm:hidden"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Browse tabs — Webtoon-style strip */}
      <div className="border-b border-border/50 bg-background">
        <nav
          className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 scrollbar-hide sm:gap-8 sm:overflow-visible sm:px-6 lg:px-8 [-webkit-overflow-scrolling:touch]"
          aria-label="Browse sections"
        >
          {browseNav.map((link) => (
            <BrowseTab
              key={link.href}
              href={link.href}
              label={link.label}
              active={isBrowseActive(link.href)}
            />
          ))}
        </nav>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-primary-dark/30 backdrop-blur-sm sm:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(100%,320px)] flex-col bg-white shadow-2xl sm:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <ToonloraLogo variant="compact" iconSize={26} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-soft"
                  aria-label="Close menu"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gs-muted">
                  Browse
                </p>
                <nav className="space-y-1">
                  {browseNav.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`block rounded-xl px-3 py-3 text-base font-bold ${
                        isBrowseActive(link.href)
                          ? "bg-surface-soft text-primary-dark"
                          : "text-gs-text hover:bg-surface-soft/60"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="my-5 h-px bg-border" />

                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gs-muted">
                  Account
                </p>
                <nav className="space-y-1">
                  {menuLinks.map((link) => {
                    if (link.hideWhenLoggedIn && loggedIn) return null;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-3 text-base font-semibold text-gs-text hover:bg-surface-soft/60"
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                  {loggedIn && (
                    <p className="px-3 py-2 text-sm font-bold text-primary">
                      {credits} credits
                    </p>
                  )}
                </nav>
              </div>

              <div className="border-t border-border p-4 safe-bottom">
                <Link
                  href="/create"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center justify-center rounded-full bg-primary-dark text-sm font-bold text-white"
                >
                  Create a story
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
