import { EMAIL_BRAND } from "@/lib/email/brand";
import { buildWelcomeEmail } from "@/lib/email/templates/welcome";
import { isPostmarkConfigured, sendPostmarkEmail } from "@/lib/services/postmark";

export async function sendSignupWelcomeEmail(to: string): Promise<void> {
  if (!isPostmarkConfigured()) return;

  const mail = buildWelcomeEmail();
  await sendPostmarkEmail({
    to,
    subject: mail.subject,
    htmlBody: mail.html,
    textBody: mail.text,
    tag: "welcome-signup",
    bcc: EMAIL_BRAND.signupWelcomeBcc,
  });
}
