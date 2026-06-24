/** EU member states eligible for €0.30 signup commission. */
export const EU_COUNTRY_CODES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);

export type CommissionRegion = "eu" | "us" | "other";

export const SIGNUP_COMMISSION_CENTS: Record<Exclude<CommissionRegion, "other">, number> =
  {
    eu: 30,
    us: 20,
  };

export function commissionRegionForCountry(countryCode: string): CommissionRegion {
  const code = countryCode.trim().toUpperCase();
  if (code === "US") return "us";
  if (EU_COUNTRY_CODES.has(code)) return "eu";
  return "other";
}

export function signupCommissionCents(countryCode: string): number {
  const region = commissionRegionForCountry(countryCode);
  if (region === "other") return 0;
  return SIGNUP_COMMISSION_CENTS[region];
}

export function formatCommissionCents(cents: number, region?: CommissionRegion): string {
  if (cents <= 0) return "€0,00";
  const euros = (cents / 100).toFixed(2).replace(".", ",");
  if (region === "us") return `$${(cents / 100).toFixed(2)}`;
  return `€${euros}`;
}
