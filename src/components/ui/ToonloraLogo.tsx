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
const ICON_SRC = "/images/toonlora-icon.png";

/** Full wordmark (1024×256). */
const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 256;

/** Cropped T mark from wordmark (282×256). */
const ICON_WIDTH = 282;
const ICON_HEIGHT = 256;

const VARIANT_HEIGHT: Record<"nav" | "compact" | "full" | "icon", number> = {
  nav: 34,
  compact: 28,
  full: 44,
  icon: 32,
};

function LogoImage({
  src,
  width,
  height,
  displayHeight,
  className = "",
  priority = false,
}: {
  src: string;
  width: number;
  height: number;
  displayHeight: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={APP_NAME}
      width={width}
      height={height}
      priority={priority}
      className={`w-auto object-contain object-left ${className}`}
      style={{ height: displayHeight }}
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
  return (
    <LogoImage
      src={ICON_SRC}
      width={ICON_WIDTH}
      height={ICON_HEIGHT}
      displayHeight={size}
      className={className}
    />
  );
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

  const useIcon = variant === "icon";

  return (
    <LogoImage
      src={useIcon ? ICON_SRC : LOGO_SRC}
      width={useIcon ? ICON_WIDTH : LOGO_WIDTH}
      height={useIcon ? ICON_HEIGHT : LOGO_HEIGHT}
      displayHeight={height}
      className={className}
      priority={variant === "nav"}
    />
  );
}
