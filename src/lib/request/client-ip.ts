/** Best-effort client IP from an incoming API request (Vercel/proxy headers). */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return null;
}

/** ISO country code from edge headers (Vercel / Cloudflare). */
export function getClientCountryCode(request: Request): string | null {
  const raw =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry");
  const code = raw?.trim().toUpperCase();
  if (!code || code === "XX" || code === "T1") return null;
  return code;
}
