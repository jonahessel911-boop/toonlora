/** Display width for LP3 funnel cover tiles (~5-col mosaic on mobile). */
export const LP3_COVER_THUMB_WIDTH = 128;

/** 2:3 cover aspect used across LP3. */
export const LP3_COVER_THUMB_HEIGHT = 192;

const SUPABASE_OBJECT_PREFIX = "/storage/v1/object/public/";

export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes(SUPABASE_OBJECT_PREFIX);
}

/**
 * Request a small WebP thumbnail from Supabase image transforms when enabled on the project.
 * Use as a direct `src` when bypassing the Next.js image optimizer.
 */
export function optimizeCoverImageUrl(
  url: string,
  {
    width = LP3_COVER_THUMB_WIDTH,
    height = LP3_COVER_THUMB_HEIGHT,
    quality = 75,
  }: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!isSupabaseStorageUrl(url)) return url;

  const renderUrl = url.replace(
    SUPABASE_OBJECT_PREFIX,
    "/storage/v1/render/image/public/"
  );
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    resize: "cover",
    format: "webp",
    quality: String(quality),
  });
  return `${renderUrl}?${params.toString()}`;
}
