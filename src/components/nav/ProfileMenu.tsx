"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreditsStore } from "@/store/useCreditsStore";
import { useUserStore } from "@/store/useUserStore";

function ProfileAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const initial = name.trim()[0]?.toUpperCase() || "T";
  const dim = size === "sm" ? "h-9 w-9 text-sm" : "h-10 w-10 text-sm";

  return (
    <span
      className={`inline-flex ${dim} items-center justify-center rounded-full bg-gradient-to-br from-[#5340FF] to-[#7C3AED] font-extrabold text-white shadow-[0_4px_14px_rgba(83,64,255,0.35)] ring-2 ring-white`}
    >
      {initial}
    </span>
  );
}

export default function ProfileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { fullName, email, logout } = useUserStore();
  const { credits } = useCreditsStore();
  const loggedIn = Boolean(email);
  const displayName = fullName.trim() || "Toonlora reader";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-0.5 transition hover:bg-[#F3ECFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5340FF]"
        aria-label={loggedIn ? "Open profile menu" : "Account"}
        aria-expanded={open}
      >
        {loggedIn ? (
          <>
            <ProfileAvatar name={displayName} />
            <span className="hidden max-w-[120px] truncate text-sm font-semibold text-[#2A114B] lg:inline">
              {displayName.split(" ")[0]}
            </span>
          </>
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7D8FF] bg-[#FCFAFF] text-[#5340FF]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+8px)] z-[80] w-[min(100vw-2rem,320px)] overflow-hidden rounded-[20px] border border-[#E7D8FF] bg-white shadow-[0_24px_64px_rgba(42,17,75,0.16)]"
          >
            {loggedIn ? (
              <>
                <div className="border-b border-[#E7D8FF] bg-gradient-to-br from-[#F3ECFF] to-white px-4 py-4">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar name={displayName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-base font-extrabold text-[#2A114B]">
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-[#667085]">{email}</p>
                    </div>
                  </div>
                  <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-[#5340FF] ring-1 ring-[#E7D8FF]">
                    {credits} credits ✦
                  </div>
                </div>

                <div className="p-2">
                  <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#667085]">
                    Your stories
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 px-1">
                    <MenuTab
                      href="/library?view=creations"
                      icon="✨"
                      label="Creations"
                      sub="Stories you made"
                      onClick={() => setOpen(false)}
                    />
                    <MenuTab
                      href="/library?view=saved"
                      icon="📚"
                      label="Library"
                      sub="Saved to read"
                      onClick={() => setOpen(false)}
                    />
                  </div>

                  <div className="my-2 h-px bg-[#E7D8FF]" />

                  <MenuLink
                    href="/profile"
                    icon="⚙️"
                    label="Settings & profile"
                    onClick={() => setOpen(false)}
                  />
                  <MenuLink
                    href="/create"
                    icon="🎬"
                    label="Create a story"
                    onClick={() => setOpen(false)}
                  />
                  <MenuLink
                    href="/library"
                    icon="🍃"
                    label="Buy credits"
                    onClick={() => setOpen(false)}
                  />

                  <div className="my-2 h-px bg-[#E7D8FF]" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#667085] transition hover:bg-[#FFF1F0] hover:text-[#B42318]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3ECFF] text-base">
                      ↪
                    </span>
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4">
                <p className="font-heading text-lg font-extrabold text-[#2A114B]">
                  Your Toonlora account
                </p>
                <p className="mt-1 text-sm text-[#667085]">
                  Sign in to save episodes, follow stories, and manage your library.
                </p>
                <div className="mt-4 space-y-2">
                  <Link
                    href="/signin"
                    onClick={() => setOpen(false)}
                    className="flex h-11 w-full items-center justify-center rounded-full bg-[#5340FF] text-sm font-bold text-white"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup/register"
                    onClick={() => setOpen(false)}
                    className="flex h-11 w-full items-center justify-center rounded-full border-2 border-[#E7D8FF] text-sm font-bold text-[#5340FF]"
                  >
                    Create free account
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuTab({
  href,
  icon,
  label,
  sub,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex flex-col rounded-xl border border-[#E7D8FF] bg-[#FCFAFF] px-3 py-3 transition hover:border-[#5340FF]/30 hover:bg-[#F3ECFF]"
    >
      <span className="text-lg">{icon}</span>
      <span className="mt-1 text-sm font-bold text-[#2A114B]">{label}</span>
      <span className="text-[10px] text-[#667085]">{sub}</span>
    </Link>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#2A114B] transition hover:bg-[#F3ECFF]"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3ECFF] text-base">
        {icon}
      </span>
      {label}
    </Link>
  );
}
