import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import {
  getProfileByEmailFromDb,
  recordLoginEvent,
} from "@/lib/services/analytics-repository";

export async function POST(request: Request) {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const profile = await getProfileByEmailFromDb(email);
    if (!profile) {
      return NextResponse.json(
        { error: "No account found with that email." },
        { status: 404 }
      );
    }

    const sessionId = getSessionFromRequest(request);
    const supabase = (await import("@/lib/supabase/admin")).getSupabaseAdmin();
    if (supabase && profile.session_id !== sessionId) {
      await supabase
        .from("profiles")
        .update({ session_id: sessionId })
        .eq("id", profile.id);
    }

    await recordLoginEvent(profile.id, "email");

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        wantsRecommendations: profile.wants_recommendations,
        countryCode: profile.country_code ?? "",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sign in failed" },
      { status: 500 }
    );
  }
}
