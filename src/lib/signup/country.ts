import { isValidCountryCode } from "@/lib/countries";
import { getClientCountryCode } from "@/lib/request/client-ip";

/** Country from signup form, else geo header, else null. */
export function resolveSignupCountryCode(
  request: Request,
  explicit?: string | null
): string | null {
  const trimmed = explicit?.trim().toUpperCase();
  if (trimmed && isValidCountryCode(trimmed)) {
    return trimmed;
  }

  const fromIp = getClientCountryCode(request);
  if (!fromIp) return null;
  if (isValidCountryCode(fromIp)) return fromIp;
  if (/^[A-Z]{2}$/.test(fromIp)) return "OTHER";

  return null;
}
