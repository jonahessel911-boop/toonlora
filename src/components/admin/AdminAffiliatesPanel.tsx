"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCommissionCents, SIGNUP_COMMISSION_CENTS } from "@/lib/affiliate/commission";
import type { AffiliatePaymentDetails } from "@/lib/services/affiliate-repository";
import { parseAffiliatePaymentDetails } from "@/lib/services/affiliate-repository";
import type {
  AffiliateApplicationRow,
  AffiliateRow,
} from "@/lib/supabase/types";
import {
  AdminAlert,
  AdminCard,
  AdminField,
  AdminInput,
  AdminPrimaryButton,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/adminUi";

interface AffiliateStatsRow {
  affiliate: AffiliateRow;
  link: string;
  signupCount: number;
  purchaseCount: number;
  commissionEarnedCents: number;
  monthlySignups: {
    month: string;
    euSignups: number;
    usSignups: number;
    otherSignups: number;
    commissionCents: number;
  }[];
}

const EMPTY_FORM = {
  slug: "",
  name: "",
  email: "",
  company: "",
  isActive: false,
  paymentMethod: "" as "" | "iban" | "paypal",
  iban: "",
  accountName: "",
  paypalEmail: "",
  notes: "",
  applicationId: "",
};

export default function AdminAffiliatesPanel() {
  const [affiliates, setAffiliates] = useState<AffiliateStatsRow[]>([]);
  const [applications, setApplications] = useState<AffiliateApplicationRow[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/affiliates");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load affiliates.");
      setAffiliates(data.affiliates ?? []);
      setApplications(data.applications ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load affiliates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");
    try {
      const paymentDetails: AffiliatePaymentDetails = {};
      if (form.paymentMethod === "iban") {
        paymentDetails.iban = form.iban.trim();
        paymentDetails.accountName = form.accountName.trim();
      }
      if (form.paymentMethod === "paypal") {
        paymentDetails.paypalEmail = form.paypalEmail.trim();
      }

      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug,
          name: form.name,
          email: form.email || undefined,
          company: form.company || undefined,
          isActive: form.isActive,
          paymentMethod: form.paymentMethod || null,
          paymentDetails,
          notes: form.notes || undefined,
          applicationId: form.applicationId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create affiliate.");

      setMessage(`Affiliate "${form.name}" created.`);
      setForm({ ...EMPTY_FORM });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create affiliate.");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (row: AffiliateStatsRow) => {
    setSavingId(row.affiliate.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/affiliates/${row.affiliate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !row.affiliate.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSavingId(null);
    }
  };

  const savePaymentSettings = async (
    row: AffiliateStatsRow,
    draft: {
      paymentMethod: "iban" | "paypal" | "";
      iban: string;
      accountName: string;
      paypalEmail: string;
      notes: string;
    }
  ) => {
    setSavingId(row.affiliate.id);
    setError("");
    try {
      const paymentDetails: AffiliatePaymentDetails = {};
      if (draft.paymentMethod === "iban") {
        paymentDetails.iban = draft.iban.trim();
        paymentDetails.accountName = draft.accountName.trim();
      }
      if (draft.paymentMethod === "paypal") {
        paymentDetails.paypalEmail = draft.paypalEmail.trim();
      }

      const res = await fetch(`/api/admin/affiliates/${row.affiliate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: draft.paymentMethod || null,
          paymentDetails,
          notes: draft.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      setMessage("Payment settings saved.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSavingId(null);
    }
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setMessage("Affiliate link copied.");
    } catch {
      setError("Could not copy link.");
    }
  };

  const startFromApplication = (app: AffiliateApplicationRow) => {
    setForm({
      ...EMPTY_FORM,
      name: app.company?.trim() || app.email.split("@")[0] || "",
      email: app.email,
      company: app.company ?? "",
      applicationId: app.id,
      slug: (app.company || app.email.split("@")[0] || "partner")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pendingApplications = applications.filter((app) => !app.affiliate_id);

  return (
    <div className="space-y-6">
      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
      {message ? <AdminAlert type="success">{message}</AdminAlert> : null}

      <AdminCard
        title="Commission rates"
        description={`EU signup: €${(SIGNUP_COMMISSION_CENTS.eu / 100).toFixed(2).replace(".", ",")} · US signup: €${(SIGNUP_COMMISSION_CENTS.us / 100).toFixed(2).replace(".", ",")} per referred user.`}
      >
        <p className="text-sm text-[#605E5C]">
          Links use{" "}
          <code className="rounded bg-[#F3F2F1] px-1.5 py-0.5 text-xs">
            toonlora.com/?aff=your-slug
          </code>
          . Only active affiliates receive new signups.
        </p>
      </AdminCard>

      <AdminCard
        title="Create affiliate"
        description="Choose a custom slug — e.g. business-comics-nl"
      >
        <form onSubmit={createAffiliate} className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Slug (URL)">
            <AdminInput
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="business-comics-nl"
              required
            />
          </AdminField>
          <AdminField label="Display name">
            <AdminInput
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Business Comics NL"
              required
            />
          </AdminField>
          <AdminField label="Email">
            <AdminInput
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </AdminField>
          <AdminField label="Company">
            <AdminInput
              value={form.company}
              onChange={(e) =>
                setForm((f) => ({ ...f, company: e.target.value }))
              }
            />
          </AdminField>
          <AdminField label="Payment method">
            <AdminSelect
              value={form.paymentMethod}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  paymentMethod: e.target.value as "" | "iban" | "paypal",
                }))
              }
            >
              <option value="">Not set</option>
              <option value="iban">IBAN</option>
              <option value="paypal">PayPal</option>
            </AdminSelect>
          </AdminField>
          <AdminField label="Active">
            <label className="mt-2 flex items-center gap-2 text-sm font-normal">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              Accept signups via this link
            </label>
          </AdminField>
          {form.paymentMethod === "iban" ? (
            <>
              <AdminField label="Account name">
                <AdminInput
                  value={form.accountName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, accountName: e.target.value }))
                  }
                />
              </AdminField>
              <AdminField label="IBAN">
                <AdminInput
                  value={form.iban}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, iban: e.target.value }))
                  }
                />
              </AdminField>
            </>
          ) : null}
          {form.paymentMethod === "paypal" ? (
            <AdminField label="PayPal email" className="sm:col-span-2">
              <AdminInput
                type="email"
                value={form.paypalEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paypalEmail: e.target.value }))
                }
              />
            </AdminField>
          ) : null}
          <AdminField label="Notes" className="sm:col-span-2">
            <AdminTextarea
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </AdminField>
          <div className="sm:col-span-2">
            <AdminPrimaryButton type="submit" loading={creating}>
              Create affiliate
            </AdminPrimaryButton>
          </div>
        </form>
      </AdminCard>

      {pendingApplications.length > 0 ? (
        <AdminCard
          title="Partner applications"
          description="Signups from /partners/affiliate — create an affiliate to activate."
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EDEBE9] text-xs uppercase tracking-wide text-[#605E5C]">
                  <th className="px-2 py-2 font-semibold">Email</th>
                  <th className="px-2 py-2 font-semibold">Company</th>
                  <th className="px-2 py-2 font-semibold">Sources</th>
                  <th className="px-2 py-2 font-semibold">Applied</th>
                  <th className="px-2 py-2 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {pendingApplications.map((app) => (
                  <tr key={app.id} className="border-b border-[#EDEBE9]">
                    <td className="px-2 py-3">{app.email}</td>
                    <td className="px-2 py-3">{app.company ?? "—"}</td>
                    <td className="px-2 py-3">
                      {app.traffic_sources.join(", ") || "—"}
                    </td>
                    <td className="px-2 py-3 text-[#605E5C]">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() => startFromApplication(app)}
                        className="text-xs font-semibold text-[#0078D4] hover:underline"
                      >
                        Create affiliate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      ) : null}

      <AdminCard title="Affiliates" description="Manage links, payouts, and performance.">
        {loading ? (
          <p className="text-sm text-[#605E5C]">Loading affiliates…</p>
        ) : affiliates.length === 0 ? (
          <p className="text-sm text-[#605E5C]">No affiliates yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EDEBE9] text-xs uppercase tracking-wide text-[#605E5C]">
                  <th className="px-2 py-2 font-semibold">Active</th>
                  <th className="px-2 py-2 font-semibold">Name</th>
                  <th className="px-2 py-2 font-semibold">Link</th>
                  <th className="px-2 py-2 font-semibold">Signups</th>
                  <th className="px-2 py-2 font-semibold">Purchases</th>
                  <th className="px-2 py-2 font-semibold">Commission</th>
                  <th className="px-2 py-2 font-semibold">Payment</th>
                  <th className="px-2 py-2 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {affiliates.map((row) => (
                  <AffiliateTableRow
                    key={row.affiliate.id}
                    row={row}
                    expanded={expandedId === row.affiliate.id}
                    saving={savingId === row.affiliate.id}
                    onToggleExpand={() =>
                      setExpandedId((id) =>
                        id === row.affiliate.id ? null : row.affiliate.id
                      )
                    }
                    onToggleActive={() => void toggleActive(row)}
                    onCopyLink={() => void copyLink(row.link)}
                    onSavePayment={(draft) =>
                      void savePaymentSettings(row, draft)
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}

function AffiliateTableRow({
  row,
  expanded,
  saving,
  onToggleExpand,
  onToggleActive,
  onCopyLink,
  onSavePayment,
}: {
  row: AffiliateStatsRow;
  expanded: boolean;
  saving: boolean;
  onToggleExpand: () => void;
  onToggleActive: () => void;
  onCopyLink: () => void;
  onSavePayment: (draft: {
    paymentMethod: "iban" | "paypal" | "";
    iban: string;
    accountName: string;
    paypalEmail: string;
    notes: string;
  }) => void;
}) {
  const payment = parseAffiliatePaymentDetails(row.affiliate);
  const [draft, setDraft] = useState({
    paymentMethod: (row.affiliate.payment_method ?? "") as
      | ""
      | "iban"
      | "paypal",
    iban: payment.iban ?? "",
    accountName: payment.accountName ?? "",
    paypalEmail: payment.paypalEmail ?? "",
    notes: row.affiliate.notes ?? "",
  });

  useEffect(() => {
    const next = parseAffiliatePaymentDetails(row.affiliate);
    setDraft({
      paymentMethod: (row.affiliate.payment_method ?? "") as
        | ""
        | "iban"
        | "paypal",
      iban: next.iban ?? "",
      accountName: next.accountName ?? "",
      paypalEmail: next.paypalEmail ?? "",
      notes: row.affiliate.notes ?? "",
    });
  }, [row.affiliate]);

  return (
    <>
      <tr className="border-b border-[#EDEBE9] align-top">
        <td className="px-2 py-3">
          <button
            type="button"
            disabled={saving}
            onClick={onToggleActive}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              row.affiliate.is_active ? "bg-[#107C10]" : "bg-[#D2D0CE]"
            }`}
            aria-label={row.affiliate.is_active ? "Deactivate" : "Activate"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                row.affiliate.is_active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </td>
        <td className="px-2 py-3">
          <p className="font-semibold text-[#323130]">{row.affiliate.name}</p>
          <p className="text-xs text-[#605E5C]">{row.affiliate.slug}</p>
        </td>
        <td className="max-w-[220px] px-2 py-3">
          <p className="truncate font-mono text-xs text-[#0078D4]">
            {row.link.replace(/^https?:\/\//, "")}
          </p>
          <button
            type="button"
            onClick={onCopyLink}
            className="mt-1 text-xs font-semibold text-[#0078D4] hover:underline"
          >
            Copy link
          </button>
        </td>
        <td className="px-2 py-3 font-semibold">{row.signupCount}</td>
        <td className="px-2 py-3 font-semibold">{row.purchaseCount}</td>
        <td className="px-2 py-3 font-semibold">
          {formatCommissionCents(row.commissionEarnedCents)}
        </td>
        <td className="px-2 py-3 text-xs text-[#605E5C]">
          {row.affiliate.payment_method === "iban"
            ? "IBAN"
            : row.affiliate.payment_method === "paypal"
              ? "PayPal"
              : "—"}
        </td>
        <td className="px-2 py-3">
          <button
            type="button"
            onClick={onToggleExpand}
            className="text-xs font-semibold text-[#0078D4] hover:underline"
          >
            {expanded ? "Hide" : "Details"}
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr className="border-b border-[#EDEBE9] bg-[#FAF9F8]">
          <td colSpan={8} className="px-4 py-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-[#323130]">
                  Signups per month
                </h4>
                {row.monthlySignups.length === 0 ? (
                  <p className="mt-2 text-sm text-[#605E5C]">No signups yet.</p>
                ) : (
                  <table className="mt-2 w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-[#605E5C]">
                        <th className="py-1">Month</th>
                        <th className="py-1">EU</th>
                        <th className="py-1">US</th>
                        <th className="py-1">Other</th>
                        <th className="py-1">Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.monthlySignups.map((month) => (
                        <tr key={month.month} className="border-t border-[#EDEBE9]">
                          <td className="py-2">{month.month}</td>
                          <td className="py-2">{month.euSignups}</td>
                          <td className="py-2">{month.usSignups}</td>
                          <td className="py-2">{month.otherSignups}</td>
                          <td className="py-2 font-semibold">
                            {formatCommissionCents(month.commissionCents)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#323130]">
                  Payment settings
                </h4>
                <div className="mt-3 space-y-3">
                  <AdminField label="Method">
                    <AdminSelect
                      value={draft.paymentMethod}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          paymentMethod: e.target.value as
                            | ""
                            | "iban"
                            | "paypal",
                        }))
                      }
                    >
                      <option value="">Not set</option>
                      <option value="iban">IBAN</option>
                      <option value="paypal">PayPal</option>
                    </AdminSelect>
                  </AdminField>
                  {draft.paymentMethod === "iban" ? (
                    <>
                      <AdminField label="Account name">
                        <AdminInput
                          value={draft.accountName}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              accountName: e.target.value,
                            }))
                          }
                        />
                      </AdminField>
                      <AdminField label="IBAN">
                        <AdminInput
                          value={draft.iban}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, iban: e.target.value }))
                          }
                        />
                      </AdminField>
                    </>
                  ) : null}
                  {draft.paymentMethod === "paypal" ? (
                    <AdminField label="PayPal email">
                      <AdminInput
                        type="email"
                        value={draft.paypalEmail}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            paypalEmail: e.target.value,
                          }))
                        }
                      />
                    </AdminField>
                  ) : null}
                  <AdminField label="Notes">
                    <AdminTextarea
                      rows={2}
                      value={draft.notes}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, notes: e.target.value }))
                      }
                    />
                  </AdminField>
                  <AdminPrimaryButton
                    loading={saving}
                    onClick={() => onSavePayment(draft)}
                  >
                    Save payment details
                  </AdminPrimaryButton>
                </div>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
