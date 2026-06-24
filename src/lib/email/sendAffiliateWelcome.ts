import { EMAIL_BRAND } from "@/lib/email/brand";
import { buildAffiliateWelcomeEmail } from "@/lib/email/templates/affiliateWelcome";
import { isPostmarkConfigured, sendPostmarkEmail } from "@/lib/services/postmark";

export async function sendAffiliateWelcomeEmail(to: string): Promise<void> {
  if (!isPostmarkConfigured()) {
    throw new Error("Email is not configured on this server.");
  }

  const mail = buildAffiliateWelcomeEmail();
  await sendPostmarkEmail({
    to,
    subject: mail.subject,
    htmlBody: mail.html,
    textBody: mail.text,
    tag: "affiliate-signup",
    bcc: EMAIL_BRAND.affiliateSignupBcc,
  });
}
