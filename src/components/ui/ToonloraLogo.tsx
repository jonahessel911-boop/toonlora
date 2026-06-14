import { APP_NAME } from "@/lib/constants";

interface ToonloraLogoProps {
  variant?: "full" | "compact" | "icon";
  className?: string;
  iconSize?: number;
}

/** Toonlora logo — speech bubble + comic panel + sparkle */
export function ToonloraIcon({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Speech bubble body */}
      <path
        d="M6 8C6 5.79086 7.79086 4 10 4H28C30.2091 4 32 5.79086 32 8V24C32 26.2091 30.2091 28 28 28H18L12 34V28H10C7.79086 28 6 26.2091 6 24V8Z"
        fill="#7C3AED"
      />
      {/* Bubble tail */}
      <path d="M12 28L8 34L10 28H12Z" fill="#7C3AED" />

      {/* Comic panel / open story page */}
      <rect x="11" y="10" width="16" height="14" rx="2" fill="white" fillOpacity="0.95" />
      <rect x="13" y="12" width="12" height="4" rx="1" fill="#E9D8FD" />
      <rect x="13" y="18" width="8" height="1.5" rx="0.75" fill="#C4B5FD" />
      <rect x="13" y="21" width="10" height="1.5" rx="0.75" fill="#C4B5FD" />

      {/* Sparkle accent */}
      <path
        d="M30 6L31.2 8.8L34 10L31.2 11.2L30 14L28.8 11.2L26 10L28.8 8.8L30 6Z"
        fill="#FFD84D"
      />
    </svg>
  );
}

export default function ToonloraLogo({
  variant = "full",
  className = "",
  iconSize = 32,
}: ToonloraLogoProps) {
  if (variant === "icon") {
    return (
      <span
        className={`inline-flex flex-shrink-0 items-center justify-center rounded-xl bg-surface-soft p-0.5 ${className}`}
      >
        <ToonloraIcon size={iconSize} />
      </span>
    );
  }

  const showWordmark = variant === "full" || variant === "compact";

  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className}`}>
      <ToonloraIcon size={iconSize} />
      {showWordmark && (
        <span
          className={`font-heading truncate text-base font-bold tracking-tight text-primary-dark sm:text-lg ${
            variant === "compact" ? "max-sm:hidden" : ""
          }`}
        >
          {APP_NAME}
        </span>
      )}
    </span>
  );
}
