import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

interface ToonloraLogoProps {
  variant?: "full" | "compact" | "icon" | "nav";
  className?: string;
  iconSize?: number;
  /** Light background — navy TOON + blue LORA */
  onLight?: boolean;
}

const LOGO_SRC = "/images/toonlora-logo.png";

function WordmarkLogo({
  className = "",
  onLight = false,
  size = "nav",
}: {
  className?: string;
  onLight?: boolean;
  size?: "nav" | "compact" | "full";
}) {
  const sizeClass =
    size === "full"
      ? "text-3xl sm:text-4xl"
      : size === "compact"
        ? "text-xl sm:text-2xl"
        : "text-xl sm:text-2xl md:text-[1.75rem]";

  return (
    <span
      className={`tl-logo-wordmark inline-flex items-baseline ${onLight ? "tl-logo-wordmark-light" : ""} ${sizeClass} ${className}`}
      aria-label={APP_NAME}
    >
      <span className="tl-logo-toon">TOON</span>
      <span className="tl-logo-lora">LORA</span>
    </span>
  );
}

/** Official Toonlora wordmark — compact icon uses scaled wordmark */
export function ToonloraIcon({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt=""
      width={320}
      height={96}
      aria-hidden
      className={`w-auto object-contain object-left ${className}`}
      style={{ height: size }}
    />
  );
}

export default function ToonloraLogo({
  variant = "full",
  className = "",
  iconSize,
  onLight = false,
}: ToonloraLogoProps) {
  if (variant === "nav") {
    return <WordmarkLogo className={className} onLight={onLight} size="nav" />;
  }

  if (variant === "compact") {
    return (
      <WordmarkLogo
        className={className}
        onLight={onLight}
        size="compact"
      />
    );
  }

  if (variant === "full") {
    return (
      <WordmarkLogo className={className} onLight={onLight} size="full" />
    );
  }

  const height = iconSize ?? 32;

  return (
    <Image
      src={LOGO_SRC}
      alt={APP_NAME}
      width={480}
      height={144}
      className={`w-auto object-contain object-left ${className}`}
      style={{ height }}
    />
  );
}
