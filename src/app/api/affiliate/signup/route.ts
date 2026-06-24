import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { sendAffiliateWelcomeEmail } from "@/lib/email/sendAffiliateWelcome";
import { createAffiliateApplication } from "@/lib/services/affiliate-repository";

const VALID_SOURCES = new Set(["meta", "tiktok", "reddit"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const company = String(body.company ?? "").trim();
    const description = String(body.description ?? "").trim();
    const sources = Array.isArray(body.sources)
      ? body.sources
          .map((s: unknown) => String(s).trim().toLowerCase())
          .filter((s: string) => VALID_SOURCES.has(s))
      : [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (sources.length === 0) {
      return NextResponse.json(
        { error: "Select at least one traffic source." },
        { status: 400 }
      );
    }

    if (isServerDatabaseConfigured()) {
      await createAffiliateApplication({
        email,
        company: company || undefined,
        description: description || undefined,
        trafficSources: sources,
      });
    }

    await sendAffiliateWelcomeEmail(email);

    console.info("[toonlora] Affiliate signup", {
      email,
      company: company || null,
      sources,
      description: description || null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not submit application.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
