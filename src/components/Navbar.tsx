"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ProfileMenu from "@/components/nav/ProfileMenu";
import ToonloraLogo from "@/components/ui/ToonloraLogo";
import { useTranslations } from "next-intl";
import { useBrowseNav } from "@/hooks/useBrowseNav";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import { useUserStore } from "@/store/useUserStore";

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

    const url = `${window.location.pathname}${hashPart}`;
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

function BrowseTab({
  href,
  id,
  label,
  active,
  onNavigate,
  darkNav = false,
}: {
  href: string;
  id: string;
  label: string;
  active: boolean;
  onNavigate: (href: string) => void;
  darkNav?: boolean;
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
        active
          ? "nav-tab-active"
          : darkNav
            ? "text-white/70 hover:text-white"
            : "text-[#6B7280] hover:text-[#2F80ED]"
      } ${active && !darkNav ? "text-[#2F80ED]" : ""} ${active && darkNav ? "text-white" : ""}`}
    >
      {label}
    </AffiliateLink>
  );
}

export default function Navbar() {
  const t = useTranslations("nav");
  const browseNav = useBrowseNav();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const navOverHero = isHome && !scrolled;
  const navDarkHome = isHome;
  const { hash: activeHash, navigateToSection } = useActiveHash();
  const { email, fullName, logout } = useUserStore();
  const loggedIn = Boolean(email);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const isBrowseActive = (href: string, id: string) => {
    if (pathname !== "/") return false;
    if (id === "home") {
      return !activeHash;
    }
    const target = href.includes("#") ? href.slice(href.indexOf("#")) : "";
    return Boolean(target) && activeHash === target;
  };

  const handleBrowseNavigate = (href: string) => {
    if (isHashLink(href) && pathname === "/") {
      navigateToSection(href);
    }
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
          navOverHero
            ? "border-b border-transparent bg-transparent"
            : navDarkHome
              ? "border-b border-white/10 bg-[#0E1117]/95 backdrop-blur-md"
              : "border-b border-white/10 bg-[#111827]/95 backdrop-blur-md"
        }`}
      >
        <div
          className={`${PAGE_CONTAINER_CLASS} relative flex h-16 items-center justify-between gap-3`}
        >
          <AffiliateLink href="/" className="flex shrink-0 items-center">
            <ToonloraLogo variant="nav" onLight={false} />
          </AffiliateLink>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 gap-5 overflow-x-auto scrollbar-hide xl:flex xl:max-w-[min(58vw,720px)]"
            aria-label={t("browseSections")}
          >
            {browseNav.map((link) => (
              <BrowseTab
                key={link.href}
                href={link.href}
                id={link.id}
                label={link.label}
                active={isBrowseActive(link.href, link.id)}
                onNavigate={handleBrowseNavigate}
                darkNav={navDarkHome}
              />
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {!loggedIn && (
              <AffiliateLink
                href="/signin"
                className={
                  navDarkHome
                    ? "tl-nav-login hidden sm:inline-flex"
                    : "hidden rounded px-3 py-2 text-sm font-semibold text-[#6B7280] transition hover:text-[#2F80ED] sm:inline-flex"
                }
              >
                {t("logIn")}
              </AffiliateLink>
            )}

            <ProfileMenu />

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white xl:hidden"
              aria-label={t("menu")}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="hidden border-t border-white/10 md:block xl:hidden">
          <nav
            className={`${PAGE_CONTAINER_CLASS} flex gap-6 overflow-x-auto scrollbar-hide sm:gap-8`}
            aria-label={t("browseSections")}
          >
            {browseNav.map((link) => (
              <BrowseTab
                key={link.href}
                href={link.href}
                id={link.id}
                label={link.label}
                active={isBrowseActive(link.href, link.id)}
                onNavigate={handleBrowseNavigate}
                darkNav={navDarkHome}
              />
            ))}
          </nav>
        </div>
      </header>

      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        browseNav={browseNav}
        isBrowseActive={(href, id) => isBrowseActive(href, id)}
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
  browseNav,
  isBrowseActive,
  loggedIn,
  fullName,
  email,
  onBrowseNavigate,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  browseNav: ReturnType<typeof useBrowseNav>;
  isBrowseActive: (href: string, id: string) => boolean;
  loggedIn: boolean;
  fullName: string;
  email: string;
  onBrowseNavigate: (href: string) => void;
  onLogout: () => void;
}) {
  const t = useTranslations("nav");
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
            aria-label={t("closeMenu")}
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
                aria-label={t("close")}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loggedIn && (
              <div className="border-b border-border bg-surface-soft px-4 py-4">
                <p className="font-heading font-extrabold text-primary">
                  {fullName || t("readerFallback")}
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
                      isBrowseActive(link.href, link.id)
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
                    {t("myLibrary")}
                  </AffiliateLink>
                </nav>
              ) : (
                <nav className="space-y-1">
                  <AffiliateLink
                    href="/signin"
                    onClick={onClose}
                    className="block rounded-xl px-3 py-3 text-base font-semibold text-gs-text hover:bg-surface-soft/60"
                  >
                    {t("logIn")}
                  </AffiliateLink>
                  <AffiliateLink
                    href="/signup/register"
                    onClick={onClose}
                    className="block rounded-xl px-3 py-3 text-base font-semibold text-gs-text hover:bg-surface-soft/60"
                  >
                    {t("createFreeAccount")}
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
                  {t("logOut")}
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
