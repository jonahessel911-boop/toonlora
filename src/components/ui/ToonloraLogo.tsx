import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

interface ToonloraLogoProps {
  variant?: "full" | "compact" | "icon" | "nav";
  className?: string;
  iconSize?: number;
}

const LOGO_SRC = "/images/toonlora-logo.png";

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
}: ToonloraLogoProps) {
  if (variant === "nav") {
    return (
      <Image
        src={LOGO_SRC}
        alt={APP_NAME}
        width={480}
        height={144}
        priority
        className={`h-11 w-auto max-w-[148px] object-contain object-left sm:h-12 sm:max-w-[168px] md:h-14 md:max-w-[196px] ${className}`}
      />
    );
  }

  const height =
    variant === "icon"
      ? (iconSize ?? 32)
      : variant === "compact"
        ? (iconSize ?? 40)
        : (iconSize ?? 52);

  const maxWidth =
    variant === "compact"
      ? "max-w-[200px] sm:max-w-[220px]"
      : "max-w-[200px] sm:max-w-[240px]";

  return (
    <Image
      src={LOGO_SRC}
      alt={APP_NAME}
      width={480}
      height={144}
      priority={variant === "full"}
      className={`w-auto object-contain object-left ${maxWidth} ${className}`}
      style={{ height }}
    />
  );
}
