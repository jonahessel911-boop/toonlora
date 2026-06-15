import { NextResponse } from "next/server";

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

    if (!email) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Hook for email provider (Resend, SendGrid, etc.)
    console.info(
      `[toonlora] Lora ready — notify ${email}: "${storyTitle}" (${body.storyId})`
    );

    return NextResponse.json({
      ok: true,
      message: `Notification queued for ${email}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Notify failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
