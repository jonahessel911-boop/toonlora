import {
  commissionRegionForCountry,
  signupCommissionCents,
  type CommissionRegion,
} from "@/lib/affiliate/commission";
import { buildAffiliateLink } from "@/lib/affiliate/links";
import { isValidAffiliateSlug, normalizeAffiliateSlug } from "@/lib/affiliate/slug";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  AffiliateApplicationRow,
  AffiliatePurchaseRow,
  AffiliateRow,
  AffiliateSignupRow,
} from "@/lib/supabase/types";

export interface AffiliatePaymentDetails {
  iban?: string;
  accountName?: string;
  paypalEmail?: string;
}

export interface AffiliateMonthlyStats {
  month: string;
  euSignups: number;
  usSignups: number;
  otherSignups: number;
  commissionCents: number;
}

export interface AffiliateWithStats {
  affiliate: AffiliateRow;
  link: string;
  signupCount: number;
  purchaseCount: number;
  commissionEarnedCents: number;
  monthlySignups: AffiliateMonthlyStats[];
}

export interface CreateAffiliateInput {
  slug: string;
  name: string;
  email?: string;
  company?: string;
  isActive?: boolean;
  paymentMethod?: "iban" | "paypal" | null;
  paymentDetails?: AffiliatePaymentDetails;
  notes?: string;
  applicationId?: string;
}

export interface UpdateAffiliateInput {
  slug?: string;
  name?: string;
  email?: string | null;
  company?: string | null;
  isActive?: boolean;
  paymentMethod?: "iban" | "paypal" | null;
  paymentDetails?: AffiliatePaymentDetails;
  notes?: string | null;
}

function rowToPaymentDetails(raw: unknown): AffiliatePaymentDetails {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  return {
    iban: typeof obj.iban === "string" ? obj.iban : undefined,
    accountName: typeof obj.accountName === "string" ? obj.accountName : undefined,
    paypalEmail:
      typeof obj.paypalEmail === "string" ? obj.paypalEmail : undefined,
  };
}

function paymentDetailsToJson(details: AffiliatePaymentDetails): Record<string, string> {
  const out: Record<string, string> = {};
  if (details.iban) out.iban = details.iban;
  if (details.accountName) out.accountName = details.accountName;
  if (details.paypalEmail) out.paypalEmail = details.paypalEmail;
  return out;
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function buildMonthlyStats(signups: AffiliateSignupRow[]): AffiliateMonthlyStats[] {
  const map = new Map<string, AffiliateMonthlyStats>();

  for (const signup of signups) {
    const key = monthKey(signup.converted_at);
    const entry = map.get(key) ?? {
      month: key,
      euSignups: 0,
      usSignups: 0,
      otherSignups: 0,
      commissionCents: 0,
    };

    if (signup.commission_region === "eu") entry.euSignups += 1;
    else if (signup.commission_region === "us") entry.usSignups += 1;
    else entry.otherSignups += 1;

    entry.commissionCents += signup.commission_cents;
    map.set(key, entry);
  }

  return Array.from(map.values()).sort((a, b) =>
    b.month.localeCompare(a.month)
  );
}

export async function listAffiliatesWithStats(): Promise<AffiliateWithStats[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { data: affiliates, error } = await supabase
    .from("affiliates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (affiliates ?? []) as AffiliateRow[];
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);

  const [{ data: signups }, { data: purchases }] = await Promise.all([
    supabase.from("affiliate_signups").select("*").in("affiliate_id", ids),
    supabase.from("affiliate_purchases").select("*").in("affiliate_id", ids),
  ]);

  const signupsByAffiliate = new Map<string, AffiliateSignupRow[]>();
  for (const signup of (signups ?? []) as AffiliateSignupRow[]) {
    const list = signupsByAffiliate.get(signup.affiliate_id) ?? [];
    list.push(signup);
    signupsByAffiliate.set(signup.affiliate_id, list);
  }

  const purchaseCountByAffiliate = new Map<string, number>();
  for (const purchase of (purchases ?? []) as AffiliatePurchaseRow[]) {
    purchaseCountByAffiliate.set(
      purchase.affiliate_id,
      (purchaseCountByAffiliate.get(purchase.affiliate_id) ?? 0) + 1
    );
  }

  return rows.map((affiliate) => {
    const affiliateSignups = signupsByAffiliate.get(affiliate.id) ?? [];
    const commissionEarnedCents = affiliateSignups.reduce(
      (sum, row) => sum + row.commission_cents,
      0
    );

    return {
      affiliate,
      link: buildAffiliateLink(affiliate.slug),
      signupCount: affiliateSignups.length,
      purchaseCount: purchaseCountByAffiliate.get(affiliate.id) ?? 0,
      commissionEarnedCents,
      monthlySignups: buildMonthlyStats(affiliateSignups),
    };
  });
}

export async function listAffiliateApplications(): Promise<
  AffiliateApplicationRow[]
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { data, error } = await supabase
    .from("affiliate_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AffiliateApplicationRow[];
}

export async function getActiveAffiliateBySlug(
  slug: string
): Promise<AffiliateRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const normalized = normalizeAffiliateSlug(slug);
  if (!isValidAffiliateSlug(normalized)) return null;

  const { data } = await supabase
    .from("affiliates")
    .select("*")
    .eq("slug", normalized)
    .eq("is_active", true)
    .maybeSingle();

  return (data as AffiliateRow | null) ?? null;
}

export async function createAffiliateApplication(input: {
  email: string;
  company?: string;
  description?: string;
  trafficSources: string[];
}): Promise<AffiliateApplicationRow> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { data, error } = await supabase
    .from("affiliate_applications")
    .insert({
      email: input.email.trim().toLowerCase(),
      company: input.company?.trim() || null,
      description: input.description?.trim() || null,
      traffic_sources: input.trafficSources,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as AffiliateApplicationRow;
}

export async function createAffiliate(
  input: CreateAffiliateInput
): Promise<AffiliateRow> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const slug = normalizeAffiliateSlug(input.slug);
  if (!isValidAffiliateSlug(slug)) {
    throw new Error(
      "Slug must be 3–64 characters: lowercase letters, numbers, and hyphens only."
    );
  }

  const { data, error } = await supabase
    .from("affiliates")
    .insert({
      slug,
      name: input.name.trim(),
      email: input.email?.trim().toLowerCase() || null,
      company: input.company?.trim() || null,
      is_active: input.isActive ?? false,
      payment_method: input.paymentMethod ?? null,
      payment_details: paymentDetailsToJson(input.paymentDetails ?? {}),
      notes: input.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This affiliate slug is already in use.");
    }
    throw new Error(error.message);
  }

  const affiliate = data as AffiliateRow;

  if (input.applicationId) {
    await supabase
      .from("affiliate_applications")
      .update({ affiliate_id: affiliate.id })
      .eq("id", input.applicationId);
  }

  return affiliate;
}

export async function updateAffiliate(
  id: string,
  input: UpdateAffiliateInput
): Promise<AffiliateRow> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.slug !== undefined) {
    const slug = normalizeAffiliateSlug(input.slug);
    if (!isValidAffiliateSlug(slug)) {
      throw new Error(
        "Slug must be 3–64 characters: lowercase letters, numbers, and hyphens only."
      );
    }
    patch.slug = slug;
  }
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.email !== undefined) {
    patch.email = input.email?.trim().toLowerCase() || null;
  }
  if (input.company !== undefined) {
    patch.company = input.company?.trim() || null;
  }
  if (input.isActive !== undefined) patch.is_active = input.isActive;
  if (input.paymentMethod !== undefined) {
    patch.payment_method = input.paymentMethod;
  }
  if (input.paymentDetails !== undefined) {
    patch.payment_details = paymentDetailsToJson(input.paymentDetails);
  }
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null;

  const { data, error } = await supabase
    .from("affiliates")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This affiliate slug is already in use.");
    }
    throw new Error(error.message);
  }

  return data as AffiliateRow;
}

export async function recordAffiliateSignupConversion(input: {
  affiliateId: string;
  profileId: string;
  countryCode: string;
}): Promise<AffiliateSignupRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const region: CommissionRegion = commissionRegionForCountry(input.countryCode);
  const commissionCents = signupCommissionCents(input.countryCode);

  await supabase
    .from("profiles")
    .update({ referred_by_affiliate_id: input.affiliateId })
    .eq("id", input.profileId);

  const { data, error } = await supabase
    .from("affiliate_signups")
    .insert({
      affiliate_id: input.affiliateId,
      profile_id: input.profileId,
      country_code: input.countryCode.toUpperCase(),
      commission_region: region,
      commission_cents: commissionCents,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return null;
    throw new Error(error.message);
  }

  return data as AffiliateSignupRow;
}

export async function recordAffiliatePurchaseConversion(input: {
  profileId: string;
  sessionId?: string;
  purchaseType: "subscription" | "coins";
  amountCents?: number;
  stripeSessionId?: string;
}): Promise<AffiliatePurchaseRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("referred_by_affiliate_id")
    .eq("id", input.profileId)
    .maybeSingle();

  const affiliateId = profile?.referred_by_affiliate_id as string | null;
  if (!affiliateId) return null;

  const { data, error } = await supabase
    .from("affiliate_purchases")
    .insert({
      affiliate_id: affiliateId,
      profile_id: input.profileId,
      session_id: input.sessionId ?? null,
      purchase_type: input.purchaseType,
      amount_cents: input.amountCents ?? null,
      stripe_session_id: input.stripeSessionId ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as AffiliatePurchaseRow;
}

export async function getProfileIdBySessionId(
  sessionId: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  return (data?.id as string | undefined) ?? null;
}

export function parseAffiliatePaymentDetails(
  affiliate: AffiliateRow
): AffiliatePaymentDetails {
  return rowToPaymentDetails(affiliate.payment_details);
}
