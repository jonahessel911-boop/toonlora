"use client";

import Link from "next/link";
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
  const { fullName, email } = useUserStore();
  const loggedIn = Boolean(email);
  const displayName = fullName.trim() || "Toonlora reader";

  return (
    <Link
      href="/profile"
      className="flex items-center gap-2 rounded-full p-0.5 transition hover:bg-[#F3ECFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5340FF]"
      aria-label={loggedIn ? "Go to profile" : "Account"}
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
    </Link>
  );
}
