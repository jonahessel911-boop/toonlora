"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ProfileMenu from "@/components/nav/ProfileMenu";
import ToonloraLogo from "@/components/ui/ToonloraLogo";
import { getStoredAffiliateSlug } from "@/lib/affiliate/client-tracking";
import { AFFILIATE_QUERY_PARAM } from "@/lib/affiliate/links";
import { HOME_BROWSE_NAV } from "@/lib/homeBrowseNav";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import { useUserStore } from "@/store/useUserStore";

const browseNav = HOME_BROWSE_NAV;

function isHashLink(href: string) {
  return href.startsWith("/#");
}

function useActiveHash() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [pathname]);

  const navigateToSection = (href: string) => {
    const hashPart = href.includes("#") ? href.slice(href.indexOf("#")) : "";
    if (!hashPart) return;

    const aff =
      new URLSearchParams(window.location.search).get(AFFILIATE_QUERY_PARAM) ??
      getStoredAffiliateSlug();
    const search = aff
      ? `?${AFFILIATE_QUERY_PARAM}=${encodeURIComponent(aff)}`
      : "";
    const url = `${window.location.pathname}${search}${hashPart}`;
    window.history.pushState(null, "", url);
    setHash(hashPart);

    const id = hashPart.replace("#", "");
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return { hash, navigateToSection };
}

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function BrowseTab({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate: (href: string) => void;
}) {
  return (
    <AffiliateLink
      href={href}
      onClick={(e) => {
        if (isHashLink(href) && window.location.pathname === "/") {
          e.preventDefault();
          onNavigate(href);
        }
      }}
      className={`nav-tab shrink-0 snap-start px-1 pb-3 pt-1 text-[13px] font-bold uppercase tracking-[0.06em] transition-colors sm:text-sm ${
        active ? "nav-tab-active text-accent" : "text-white/60 hover:text-accent"
      }`}
    >
      {label}
    </AffiliateLink>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { hash: activeHash, navigateToSection } = useActiveHash();
  const { email, fullName, logout } = useUserStore();
  const loggedIn = Boolean(email);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isBrowseActive = (href: string) => {
    if (pathname !== "/") return false;
    const target = href.includes("#") ? href.slice(href.indexOf("#")) : "";
    if (!activeHash && target === "#this-week") return true;
    return activeHash === target;
  };

  const handleBrowseNavigate = (href: string) => {
    if (isHashLink(href) && pathname === "/") {
      navigateToSection(href);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-nav-bg">
        <div className={`${PAGE_CONTAINER_CLASS} flex h-16 items-center justify-between gap-3`}>
          <AffiliateLink href="/" className="flex shrink-0 items-center">
            <ToonloraLogo variant="nav" />
          </AffiliateLink>

          <div className="flex items-center gap-1 sm:gap-2">
            {!loggedIn && (
              <AffiliateLink href="/signin" className="tl-nav-login hidden sm:inline-flex">
                Log in
              </AffiliateLink>
            )}

            <ProfileMenu />

            <AffiliateLink
              href="/#this-week"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white sm:flex"
              aria-label="Search stories"
            >
              <SearchIcon />
            </AffiliateLink>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="hidden border-t border-white/10 md:block">
          <nav
            className={`${PAGE_CONTAINER_CLASS} flex gap-6 overflow-x-auto scrollbar-hide sm:gap-8`}
            aria-label="Browse sections"
          >
            {browseNav.map((link) => (
              <BrowseTab
                key={link.href}
                href={link.href}
                label={link.label}
                active={isBrowseActive(link.href)}
                onNavigate={handleBrowseNavigate}
              />
            ))}
          </nav>
        </div>
      </header>

      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        isBrowseActive={isBrowseActive}
        loggedIn={loggedIn}
        fullName={fullName}
        email={email}
        onBrowseNavigate={handleBrowseNavigate}
        onLogout={() => {
          logout();
          setOpen(false);
          router.push("/");
        }}
      />
    </>
  );
}

function MobileDrawer({
  open,
  onClose,
  isBrowseActive,
  loggedIn,
  fullName,
  email,
  onBrowseNavigate,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  isBrowseActive: (href: string) => boolean;
  loggedIn: boolean;
  fullName: string;
  email: string;
  onBrowseNavigate: (href: string) => void;
  onLogout: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-primary/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-label="Close menu"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(100%,320px)] flex-col bg-white shadow-2xl md:hidden"
          >
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <ToonloraLogo variant="nav" onLight />
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-soft"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loggedIn && (
              <div className="border-b border-border bg-surface-soft px-4 py-4">
                <p className="font-heading font-extrabold text-primary">
                  {fullName || "Toonlora reader"}
                </p>
                <p className="text-xs text-muted">{email}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <nav className="space-y-1">
                {browseNav.map((link) => (
                  <AffiliateLink
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      if (isHashLink(link.href) && window.location.pathname === "/") {
                        e.preventDefault();
                        onBrowseNavigate(link.href);
                      }
                      onClose();
                    }}
                    className={`block rounded-xl px-3 py-3 text-base font-bold ${
                      isBrowseActive(link.href)
                        ? "bg-primary-soft text-accent"
                        : "text-gs-text hover:bg-surface-soft/60"
                    }`}
                  >
                    {link.label}
                  </AffiliateLink>
                ))}
              </nav>

              <div className="my-5 h-px bg-border" />

              {loggedIn ? (
                <nav className="space-y-1">
                  <AffiliateLink
                    href="/profile"
                    onClick={onClose}
                    className="block rounded-xl px-3 py-3 text-base font-semibold text-gs-text hover:bg-surface-soft/60"
                  >
                    My Library
                  </AffiliateLink>
                </nav>
              ) : (
                <nav className="space-y-1">
                  <AffiliateLink
                    href="/signin"
                    onClick={onClose}
                    className="block rounded-xl px-3 py-3 text-base font-semibold text-gs-text hover:bg-surface-soft/60"
                  >
                    Log in
                  </AffiliateLink>
                  <AffiliateLink
                    href="/signup/register"
                    onClick={onClose}
                    className="block rounded-xl px-3 py-3 text-base font-semibold text-gs-text hover:bg-surface-soft/60"
                  >
                    Create free account
                  </AffiliateLink>
                </nav>
              )}
            </div>

            {loggedIn && (
              <div className="border-t border-border p-4 safe-bottom">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex w-full items-center justify-center rounded-full border border-border py-3 text-sm font-bold text-muted"
                >
                  Log out
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
