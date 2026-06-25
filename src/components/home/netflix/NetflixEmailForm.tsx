"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface NetflixEmailFormProps {
  id?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export default function NetflixEmailForm({
  id,
  className = "",
  inputClassName = "",
  buttonClassName = "",
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

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={`flex w-full max-w-3xl flex-col gap-3 sm:flex-row ${className}`}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email address"
        className={`min-h-[56px] flex-1 rounded bg-black/60 px-4 text-base text-white placeholder:text-white/50 ring-1 ring-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent ${inputClassName}`}
      />
      <button
        type="submit"
        className={`inline-flex min-h-[56px] shrink-0 items-center justify-center gap-2 rounded bg-accent px-6 text-lg font-bold text-white transition hover:bg-accent-hover sm:px-8 ${buttonClassName}`}
      >
        Get Started
        <span aria-hidden className="text-xl leading-none">
          ›
        </span>
      </button>
    </form>
  );
}
