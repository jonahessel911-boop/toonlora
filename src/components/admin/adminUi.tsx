"use client";

import type { ReactNode } from "react";
import {
  DEFAULT_PLATFORM_GENRE,
  PLATFORM_GENRES,
} from "@/lib/platformGenres";
import { PIPELINE_CATEGORY_OPTIONS } from "@/lib/browseCategories";

export { PLATFORM_GENRES, DEFAULT_PLATFORM_GENRE };

export const ADMIN_GRADIENTS = [
  { id: "purple", class: "from-[#5340FF] via-[#7C3AED] to-[#FF4FA3]" },
  { id: "coral", class: "from-[#FF6847] via-[#FF4FA3] to-[#5340FF]" },
  { id: "ocean", class: "from-[#22D3EE] via-[#5340FF] to-[#2A114B]" },
  { id: "sunset", class: "from-[#FFE033] via-[#FF6847] to-[#FBBF24]" },
] as const;

const inputClass =
  "mt-1.5 w-full rounded-lg border border-[#D2D0CE] bg-white px-3 py-2.5 text-sm text-[#323130] outline-none transition placeholder:text-[#A19F9D] focus:border-[#0078D4] focus:ring-2 focus:ring-[#0078D4]/20";

export function AdminCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-[#EDEBE9] bg-white shadow-sm ${className}`}
    >
      <div className="border-b border-[#EDEBE9] bg-[#FAF9F8] px-5 py-4">
        <h3 className="text-sm font-semibold text-[#323130]">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-[#605E5C]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function AdminField({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-xs font-semibold text-[#323130] ${className}`}>
      {label}
      {children}
      {hint ? (
        <span className="mt-1 block text-[11px] font-normal text-[#605E5C]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function AdminInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function AdminSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select {...props} className={`${inputClass} ${props.className ?? ""}`} />
  );
}

export function AdminTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`${inputClass} resize-y ${props.className ?? ""}`}
    />
  );
}

export function AdminGenreSelect(
  props: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children">
) {
  return <AdminBrowseCategorySelect {...props} />;
}

export function AdminBrowseCategorySelect(
  props: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children">
) {
  return (
    <AdminSelect {...props}>
      {PIPELINE_CATEGORY_OPTIONS.map((category) => (
        <option key={category.value} value={category.value}>
          {category.label}
        </option>
      ))}
    </AdminSelect>
  );
}

export function GradientPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (gradient: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ADMIN_GRADIENTS.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => onChange(g.class)}
          className={`h-11 w-[4.5rem] rounded-lg bg-gradient-to-br ${g.class} ring-2 ring-offset-2 transition ${
            value === g.class
              ? "ring-[#0078D4]"
              : "ring-transparent hover:ring-[#D2D0CE]"
          }`}
          aria-label={`Cover gradient ${g.id}`}
        />
      ))}
    </div>
  );
}

export function AdminAlert({
  type,
  children,
}: {
  type: "error" | "success";
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-lg px-4 py-3 text-sm ${
        type === "error"
          ? "border border-[#F1BBBC] bg-[#FDE7E9] text-[#A4262C]"
          : "border border-[#B7E0B7] bg-[#DFF6DD] text-[#107C10]"
      }`}
    >
      {children}
    </div>
  );
}

export function AdminTabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-[#EDEBE9] bg-white p-1.5 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-none sm:min-w-[10rem] ${
            active === tab.id
              ? "bg-[#0078D4] text-white shadow-sm"
              : "text-[#605E5C] hover:bg-[#F3F2F1]"
          }`}
        >
          <span aria-hidden>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function AdminPrimaryButton({
  children,
  loading,
  disabled,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "success";
}) {
  const colors =
    variant === "success"
      ? "bg-[#107C10] hover:bg-[#0B5A0B] disabled:bg-[#107C10]/50"
      : "bg-[#0078D4] hover:bg-[#106EBE] disabled:bg-[#0078D4]/50";

  return (
    <button
      type="button"
      disabled={disabled || loading}
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed ${colors} ${props.className ?? ""}`}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      {children}
    </button>
  );
}
