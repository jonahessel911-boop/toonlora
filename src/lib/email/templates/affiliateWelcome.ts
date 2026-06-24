import { EMAIL_BRAND } from "@/lib/email/brand";
import { wrapEmailHtml } from "@/lib/email/layout";
import {
  formatCommissionCents,
  SIGNUP_COMMISSION_CENTS,
} from "@/lib/affiliate/commission";

const EARNINGS_SIGNUP_COUNTS = [150, 500, 1500, 2250] as const;

const EARNINGS_SCENARIO_LABELS = [
  "Conservative",
  "Base case",
  "Strong",
  "Viral / high intent",
] as const;

function buildEarningsRows() {
  return EARNINGS_SIGNUP_COUNTS.map((signups, index) => ({
    scenario: EARNINGS_SCENARIO_LABELS[index],
    signups,
    eu: formatCommissionCents(signups * SIGNUP_COMMISSION_CENTS.eu),
    us: formatCommissionCents(signups * SIGNUP_COMMISSION_CENTS.us, "us"),
  }));
}

const EU_SIGNUP_RATE = formatCommissionCents(SIGNUP_COMMISSION_CENTS.eu);
const US_SIGNUP_RATE = formatCommissionCents(
  SIGNUP_COMMISSION_CENTS.us,
  "us"
);

function earningsTableHtml(): string {
  const rows = buildEarningsRows().map(
    (row) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid ${EMAIL_BRAND.border};font-size:13px;color:${EMAIL_BRAND.purpleDark};">${row.scenario}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${EMAIL_BRAND.border};font-size:13px;text-align:right;color:${EMAIL_BRAND.muted};">${row.signups.toLocaleString()}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${EMAIL_BRAND.border};font-size:13px;text-align:right;font-weight:700;color:${EMAIL_BRAND.purple};">${row.eu}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${EMAIL_BRAND.border};font-size:13px;text-align:right;font-weight:700;color:${EMAIL_BRAND.purple};">${row.us}</td>
    </tr>`
  ).join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;border:1px solid ${EMAIL_BRAND.border};border-radius:12px;overflow:hidden;border-collapse:separate;">
      <tr style="background:${EMAIL_BRAND.lavender};">
        <th align="left" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${EMAIL_BRAND.muted};">Scenario</th>
        <th align="right" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${EMAIL_BRAND.muted};">Signups</th>
        <th align="right" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${EMAIL_BRAND.muted};">EU</th>
        <th align="right" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${EMAIL_BRAND.muted};">US</th>
      </tr>
      ${rows}
    </table>`;
}

export function buildAffiliateWelcomeEmail(): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Thank you for signing up for the Toonlora affiliate program";

  const body = `
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;font-weight:800;color:${EMAIL_BRAND.purpleDark};">
      Thank you for signing up!
    </h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${EMAIL_BRAND.muted};">
      Welcome to the <strong>Toonlora Affiliate Program</strong>. Your
      <strong>Earnings Kit</strong> is below — commission rates and estimated
      earnings per 1M views.
    </p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${EMAIL_BRAND.muted};">
      An account manager will contact you within <strong>5 business days</strong> to
      set up your affiliate account, referral link, and tracking.
    </p>

    <h2 style="margin:24px 0 8px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${EMAIL_BRAND.muted};">
      Commission per signup
    </h2>
    <ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.8;color:${EMAIL_BRAND.purpleDark};">
      <li><strong>EU:</strong> ${EU_SIGNUP_RATE} per signup</li>
      <li><strong>US:</strong> ${US_SIGNUP_RATE} per signup</li>
      <li><strong>Other regions:</strong> Not supported at this time</li>
    </ul>

    <h2 style="margin:28px 0 8px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${EMAIL_BRAND.muted};">
      Realistic funnel (good short-form content)
    </h2>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.muted};">
      Per <strong>1,000,000 views</strong>: roughly 0.3%–1.5% click through → 3,000–15,000 visitors.
      Of those visitors, about 5%–15% create an account → <strong>150–2,250 signups</strong>.
    </p>

    <h2 style="margin:24px 0 8px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${EMAIL_BRAND.muted};">
      Earnings per 1M views (estimate)
    </h2>
    ${earningsTableHtml()}

    <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.muted};">
      Questions? Reply to this email — we&apos;re happy to help you get started.
    </p>
    <p style="margin:16px 0 0;font-size:14px;font-weight:700;color:${EMAIL_BRAND.purple};">
      — The Toonlora team
    </p>
  `;

  const html = wrapEmailHtml({
    preheader: "Your Toonlora affiliate Earnings Kit — commission rates & 1M view estimates.",
    body,
  });

  const earningsRows = buildEarningsRows();
  const earningsText = earningsRows
    .map(
      (row) =>
        `${row.scenario} — ${row.signups.toLocaleString()} signups — ${row.eu} EU / ${row.us} US`
    )
    .join("\n");

  const text = `Thank you for signing up for the Toonlora affiliate program!

An account manager will contact you within 5 business days to set up your affiliate account, referral link, and tracking.

Commission per signup:
- EU: ${EU_SIGNUP_RATE} per signup
- US: ${US_SIGNUP_RATE} per signup
- Other regions: Not supported

Realistic funnel per 1M views:
- 0.3%–1.5% click through → 3,000–15,000 visitors
- 5%–15% of visitors sign up → 150–2,250 signups

Earnings per 1M views (estimate):
${earningsText}

— The Toonlora team`;

  return { subject, html, text };
}
