"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreditsStore } from "@/store/useCreditsStore";
import { useUserStore } from "@/store/useUserStore";

export default function ProfileApp() {
  const router = useRouter();
  const { fullName, email, wantsRecommendations, logout } = useUserStore();
  const { credits } = useCreditsStore();
  const initial = fullName.trim()[0]?.toUpperCase() || "T";

  if (!email) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-extrabold text-[#2A114B]">
          Sign in to view your profile
        </h1>
        <p className="mt-2 text-sm text-[#667085]">
          Save episodes, manage your library, and track credits.
        </p>
        <Link
          href="/signin"
          className="btn-coral mt-6 px-8 py-3 text-sm font-extrabold"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <div className="overflow-hidden rounded-[28px] border border-[#E7D8FF] bg-white shadow-[0_20px_60px_rgba(83,64,255,0.08)]">
        <div className="bg-gradient-to-br from-[#F3ECFF] to-white px-6 py-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#5340FF] to-[#7C3AED] text-3xl font-extrabold text-white shadow-lg ring-4 ring-white">
            {initial}
          </div>
          <h1 className="font-heading mt-4 text-2xl font-extrabold text-[#2A114B]">
            {fullName || "Toonlora reader"}
          </h1>
          <p className="mt-1 text-sm text-[#667085]">{email}</p>
          <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-[#5340FF] ring-1 ring-[#E7D8FF]">
            {credits} credits ✦
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-[#E7D8FF] p-4">
          <Link
            href="/library?view=creations"
            className="rounded-2xl border border-[#E7D8FF] bg-[#FCFAFF] p-4 text-left transition hover:bg-[#F3ECFF]"
          >
            <span className="text-xl">✨</span>
            <p className="mt-2 font-bold text-[#2A114B]">Creations</p>
            <p className="text-xs text-[#667085]">Stories you made</p>
          </Link>
          <Link
            href="/library?view=saved"
            className="rounded-2xl border border-[#E7D8FF] bg-[#FCFAFF] p-4 text-left transition hover:bg-[#F3ECFF]"
          >
            <span className="text-xl">📚</span>
            <p className="mt-2 font-bold text-[#2A114B]">Library</p>
            <p className="text-xs text-[#667085]">Saved to read</p>
          </Link>
        </div>

        <div className="space-y-1 border-t border-[#E7D8FF] p-3">
          {[
            { label: "Create a story", href: "/create", icon: "🎬" },
            { label: "Buy credits", href: "/library", icon: "🍃" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#2A114B] transition hover:bg-[#F3ECFF]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3ECFF]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {wantsRecommendations && (
        <p className="mt-4 text-center text-xs text-[#667085]">
          Story recommendations enabled ⭐
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="mt-6 flex w-full items-center justify-center rounded-full border border-[#E7D8FF] py-3 text-sm font-bold text-[#667085] transition hover:bg-[#FFF1F0] hover:text-[#B42318]"
      >
        Log out
      </button>
    </div>
  );
}
