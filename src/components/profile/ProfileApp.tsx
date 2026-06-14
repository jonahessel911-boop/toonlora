"use client";

import { useUserStore } from "@/store/useUserStore";
import { AppHeader } from "@/components/layout/AppChrome";
import Link from "next/link";

export default function ProfileApp() {
  const { fullName, email, wantsRecommendations } = useUserStore();

  return (
    <>
      <AppHeader showCredits={false} />
      <div className="mx-auto max-w-lg px-4 pb-28 pt-4">
        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-600 text-3xl text-white shadow-lg">
            {fullName ? fullName[0]?.toUpperCase() : "L"}
          </div>
          <h2 className="mt-4 text-xl font-black text-gray-900">
            {fullName || "Story Creator"}
          </h2>
          <p className="text-sm text-gray-500">{email || "Not signed in"}</p>
        </div>

        <div className="mt-8 space-y-3">
          {[
            { label: "My Library", href: "/library", icon: "📚" },
            { label: "Create story", href: "/create", icon: "✨" },
            { label: "Buy credits", href: "/library", icon: "🍃" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-4 shadow-sm"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold text-gray-800">{item.label}</span>
            </Link>
          ))}
        </div>

        {wantsRecommendations && (
          <p className="mt-6 text-center text-xs text-gray-400">
            Story recommendations enabled ⭐
          </p>
        )}
      </div>
    </>
  );
}
