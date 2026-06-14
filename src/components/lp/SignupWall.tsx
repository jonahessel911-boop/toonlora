"use client";

import Link from "next/link";

interface SignupWallProps {
  storyName: string;
  open: boolean;
  onClose: () => void;
}

/** Intended UX for post–episode-1 signup. Wire up when auth is ready. */
export default function SignupWall({
  storyName,
  open,
  onClose,
}: SignupWallProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-gray-900">
          Want to continue reading?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Create a free account to read more of{" "}
          <span className="font-bold text-gray-900">{storyName}</span>, save your
          progress, and follow new episodes.
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-gray-200 py-3 text-sm font-bold text-gray-700"
          >
            Continue with Google
          </button>
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border-2 border-border px-4 py-3 text-sm outline-none focus:border-groen-primary"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border-2 border-border px-4 py-3 text-sm outline-none focus:border-groen-primary"
          />
          <Link
            href="/signup/register"
            className="flex w-full items-center justify-center rounded-full bg-groen-deep py-3.5 text-sm font-bold text-white"
          >
            Create free account
          </Link>
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/signin" className="font-bold text-groen-deep">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
