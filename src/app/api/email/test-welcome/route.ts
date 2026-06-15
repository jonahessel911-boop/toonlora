import { NextResponse } from "next/server";
import { buildWelcomeEmail } from "@/lib/email/templates/welcome";
import { isPostmarkConfigured, sendPostmarkEmail } from "@/lib/services/postmark";

interface TestWelcomeRequest {
  to?: string;
}

export async function POST(request: Request) {
  try {
    if (!isPostmarkConfigured()) {
      return NextResponse.json(
        { error: "POSTMARK_SERVER_TOKEN is not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as TestWelcomeRequest;
    const to = body.to?.trim() || "jonahessel911@gmail.com";

    const mail = buildWelcomeEmail();
    const result = await sendPostmarkEmail({
      to,
      subject: mail.subject,
      htmlBody: mail.html,
      textBody: mail.text,
      tag: "welcome-test",
    });

    return NextResponse.json({
      ok: true,
      messageId: result.messageId,
      to: result.to,
      subject: mail.subject,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send test email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
