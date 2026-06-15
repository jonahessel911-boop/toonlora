"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface SignupWallProps {
  storyName: string;
  open: boolean;
  onClose: () => void;
}

export default function SignupWall({
  storyName,
  open,
  onClose,
}: SignupWallProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#2A114B]/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[#E7D8FF] bg-white shadow-[0_32px_80px_rgba(42,17,75,0.25),0_0_0_1px_rgba(124,58,237,0.08)]"
      >
        {/* Purple glow header */}
        <div className="relative bg-gradient-to-br from-[#F3ECFF] to-white px-6 pb-4 pt-8 text-center">
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#5340FF]/15 blur-2xl"
            aria-hidden
          />
          <motion.span
            animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative inline-block text-2xl"
            aria-hidden
          >
            ✦
          </motion.span>
          <h2 className="font-heading relative mt-2 text-2xl font-extrabold text-[#2A114B]">
            Want to continue reading?
          </h2>
          <p className="relative mt-2 text-sm leading-relaxed text-[#667085]">
            Create a free account to read more of{" "}
            <span className="font-bold text-[#2A114B]">{storyName}</span>, save
            your progress, and follow new episodes.
          </p>
        </div>

        <div className="space-y-3 px-6 pb-6 pt-2">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-[#E7D8FF] bg-white text-sm font-bold text-[#101828] shadow-sm transition hover:bg-[#F3ECFF]/50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <Link
            href="/signup/register"
            className="btn-coral h-14 w-full text-base font-extrabold"
          >
            Create free account
          </Link>

          <Link
            href="/signin"
            className="flex h-12 w-full items-center justify-center rounded-full border-2 border-[#5340FF]/30 bg-white text-sm font-bold text-[#5340FF] transition hover:bg-[#F3ECFF]/40"
          >
            Log in
          </Link>

          <p className="pt-1 text-center text-xs text-[#667085]">
            Episode 1 is free. Creating stories uses credits.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
