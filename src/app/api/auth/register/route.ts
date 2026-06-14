import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { registerProfileInDb } from "@/lib/services/profile-repository";

export async function POST(request: Request) {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "Database not configured. Add Supabase env vars and set NEXT_PUBLIC_USE_DATABASE=true.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    const sessionId = getSessionFromRequest(request);
    const profile = await registerProfileInDb(sessionId, {
      fullName,
      email,
      wantsRecommendations: body.wantsRecommendations !== false,
    });

    return NextResponse.json({ profile, source: "supabase" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed" },
      { status: 500 }
    );
  }
}
