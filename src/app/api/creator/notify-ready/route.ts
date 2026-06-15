import { NextResponse } from "next/server";
import { buildComicReadyEmail } from "@/lib/email/templates/comic-ready";
import { isPostmarkConfigured, sendPostmarkEmail } from "@/lib/services/postmark";

interface NotifyReadyRequest {
  email?: string;
  storyId?: string;
  storyTitle?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NotifyReadyRequest;
    const email = body.email?.trim();
    const storyTitle = body.storyTitle?.trim() ?? "Your comic";
    const storyId = body.storyId?.trim();

    if (!email) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    if (!isPostmarkConfigured()) {
      console.info(
        `[toonlora] Lora ready (no Postmark) — ${email}: "${storyTitle}" (${storyId})`
      );
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "postmark_not_configured",
      });
    }

    if (!storyId) {
      return NextResponse.json(
        { error: "storyId is required to send comic ready email" },
        { status: 400 }
      );
    }

    const mail = buildComicReadyEmail({ storyTitle, storyId });
    const result = await sendPostmarkEmail({
      to: email,
      subject: mail.subject,
      htmlBody: mail.html,
      textBody: mail.text,
      tag: "comic-ready",
    });

    return NextResponse.json({
      ok: true,
      messageId: result.messageId,
      to: result.to,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Notify failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
