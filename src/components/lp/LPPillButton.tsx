"use client";

import { type ButtonHTMLAttributes } from "react";

type LPPillButtonVariant = "primary" | "secondary" | "ghost";

interface LPPillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LPPillButtonVariant;
}

const variantClass: Record<LPPillButtonVariant, string> = {
  primary: "lp-pill-btn",
  secondary: "lp-pill-btn lp-pill-btn-secondary",
  ghost: "lp-pill-btn lp-pill-btn-ghost",
};

export default function LPPillButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: LPPillButtonProps) {
  return (
    <button
      type="button"
      className={`${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
