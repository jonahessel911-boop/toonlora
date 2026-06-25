import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

interface ToonloraLogoProps {
  variant?: "full" | "compact" | "icon" | "nav";
  className?: string;
  iconSize?: number;
  /** @deprecated Blue wordmark works on light and dark backgrounds */
  onLight?: boolean;
}

const LOGO_SRC = "/images/toonlora-logo.png";

/** Intrinsic dimensions after trim (892×160). */
const LOGO_WIDTH = 892;
const LOGO_HEIGHT = 160;

const VARIANT_HEIGHT: Record<"nav" | "compact" | "full" | "icon", number> = {
  nav: 34,
  compact: 28,
  full: 44,
  icon: 32,
};

function LogoImage({
  height,
  className = "",
  priority = false,
}: {
  height: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt={APP_NAME}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      className={`w-auto object-contain object-left ${className}`}
      style={{ height }}
    />
  );
}

/** Compact mark for tight spaces (reader bar, etc.). */
export function ToonloraIcon({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return <LogoImage height={size} className={className} />;
}

export default function ToonloraLogo({
  variant = "full",
  className = "",
  iconSize,
}: ToonloraLogoProps) {
  const height =
    iconSize ??
    VARIANT_HEIGHT[variant === "icon" ? "icon" : variant] ??
    VARIANT_HEIGHT.full;

  return (
    <LogoImage
      height={height}
      className={className}
      priority={variant === "nav"}
    />
  );
}
