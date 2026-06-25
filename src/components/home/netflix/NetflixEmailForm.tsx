"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface NetflixEmailFormProps {
  id?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  variant?: "dark" | "light";
}

export default function NetflixEmailForm({
  id,
  className = "",
  inputClassName = "",
  buttonClassName = "",
  variant = "dark",
}: NetflixEmailFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("email", trimmed);
    router.push(
      `/signup/register${params.size ? `?${params.toString()}` : ""}`
    );
  };

  const isLight = variant === "light";

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={`flex w-full max-w-2xl flex-col gap-3 sm:flex-row ${className}`}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email address"
        className={`min-h-[50px] flex-1 rounded-lg px-4 text-base focus:outline-none focus:ring-2 focus:ring-[#2F80ED] ${
          isLight
            ? "border border-[#E7DDCC] bg-[#FFFDF7] text-[#0E1726] placeholder:text-[#64748B]"
            : "bg-black/60 text-white placeholder:text-white/50 ring-1 ring-white/30 backdrop-blur-sm focus:ring-accent"
        } ${inputClassName}`}
      />
      <button
        type="submit"
        className={`inline-flex min-h-[50px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[#2F80ED] px-6 text-base font-bold text-white transition hover:bg-[#1F6FD6] sm:px-7 ${buttonClassName}`}
      >
        Get Started
        <span aria-hidden className="text-xl leading-none">
          ›
        </span>
      </button>
    </form>
  );
}
