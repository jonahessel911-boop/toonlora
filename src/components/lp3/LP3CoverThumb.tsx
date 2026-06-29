"use client";

import Image from "next/image";
import {
  LP3_COVER_THUMB_HEIGHT,
  LP3_COVER_THUMB_WIDTH,
} from "@/lib/images/cover-image";

interface LP3CoverThumbProps {
  src: string;
  alt?: string;
  className?: string;
  /** Eager-load above-the-fold mosaic tiles. */
  priority?: boolean;
  width?: number;
  height?: number;
}

/**
 * Small LP3 cover tile — served as WebP via the Next.js image optimizer.
 */
export default function LP3CoverThumb({
  src,
  alt = "",
  className = "h-full w-full object-cover",
  priority = false,
  width = LP3_COVER_THUMB_WIDTH,
  height = LP3_COVER_THUMB_HEIGHT,
}: LP3CoverThumbProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={`${width}px`}
      quality={75}
    />
  );
}
