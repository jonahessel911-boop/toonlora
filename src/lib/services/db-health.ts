import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isDatabaseEnabled, isServerDatabaseConfigured } from "@/lib/config";

export interface DbHealthReport {
  ok: boolean;
  timestamp: string;
  checks: {
    useDatabaseFlag: boolean;
    supabaseUrlSet: boolean;
    serviceRoleKeySet: boolean;
    supabaseUrlFormat: "ok" | "invalid" | "missing";
    supabaseReachable: boolean;
    userSessionsTable: boolean;
    profilesTable: boolean;
  };
  errors: string[];
  hints: string[];
  urlPreview?: string;
}

function getUrlPreview(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    const parsed = new URL(url.replace(/\/rest\/v1\/?$/, ""));
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "invalid-url";
  }
}

export async function checkDatabaseHealth(): Promise<DbHealthReport> {
  const errors: string[] = [];
  const hints: string[] = [];

  const useDatabaseFlag = isDatabaseEnabled();
  const supabaseUrlSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const serviceRoleKeySet = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

  let supabaseUrlFormat: DbHealthReport["checks"]["supabaseUrlFormat"] = "missing";
  if (supabaseUrlSet) {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
    if (raw.startsWith("eyJ")) {
      supabaseUrlFormat = "invalid";
      errors.push(
        "NEXT_PUBLIC_SUPABASE_URL contains a JWT key, not a URL. You pasted the service_role key in the URL field."
      );
      hints.push(
        "Use Project URL from Supabase → Settings → API, e.g. https://tchszmoegruwtyfmytng.supabase.co"
      );
      hints.push("Put the service_role secret in SUPABASE_SERVICE_ROLE_KEY only.");
    } else if (raw.includes("/rest/v1")) {
      supabaseUrlFormat = "invalid";
      errors.push("NEXT_PUBLIC_SUPABASE_URL must not include /rest/v1/");
      hints.push("Use https://YOUR-PROJECT.supabase.co (project root only).");
    } else {
      try {
        new URL(raw);
        supabaseUrlFormat = "ok";
      } catch {
        supabaseUrlFormat = "invalid";
        errors.push("NEXT_PUBLIC_SUPABASE_URL is not a valid URL.");
      }
    }
  } else {
    errors.push("NEXT_PUBLIC_SUPABASE_URL is missing.");
  }

  if (!serviceRoleKeySet) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY is missing.");
  }

  if (!useDatabaseFlag) {
    errors.push("NEXT_PUBLIC_USE_DATABASE is not set to true.");
    hints.push("Add NEXT_PUBLIC_USE_DATABASE=true to .env.local and restart npm run dev.");
  }

  if (!supabaseUrlSet || !serviceRoleKeySet) {
    hints.push("Create .env.local in the project root (copy from .env.example).");
    hints.push("Restart the dev server after changing env vars.");
  }

  let supabaseReachable = false;
  let userSessionsTable = false;
  let profilesTable = false;

  if (isServerDatabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error: sessionProbe } = await supabase
        .from("user_sessions")
        .select("session_id")
        .limit(1);

      if (sessionProbe) {
        const msg = sessionProbe.message || "Unknown error";
        if (msg.includes("Invalid API key") || sessionProbe.code === "401") {
          errors.push("Supabase rejected the service_role key (Invalid API key).");
          hints.push(
            "Copy a fresh service_role key from Supabase → Settings → API → service_role (secret)."
          );
          hints.push("Paste it in .env.local as SUPABASE_SERVICE_ROLE_KEY, then restart npm run dev.");
        } else if (msg.includes("does not exist")) {
          errors.push("Table user_sessions does not exist — run migration 001_initial_schema.sql.");
        } else {
          errors.push(`user_sessions probe failed: ${msg}`);
        }
      } else {
        supabaseReachable = true;
        userSessionsTable = true;
      }

      const { error: profileProbe } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (profileProbe) {
        const msg = profileProbe.message || "Unknown error";
        if (msg.includes("Invalid API key")) {
          // already reported above
        } else if (msg.includes("does not exist")) {
          errors.push("Table profiles does not exist — run migration 002_profiles.sql.");
        } else if (!errors.some((e) => e.includes("service_role"))) {
          errors.push(`profiles probe failed: ${msg}`);
        }
      } else {
        profilesTable = true;
      }
    }
  }

  const ok =
    useDatabaseFlag &&
    supabaseUrlFormat === "ok" &&
    serviceRoleKeySet &&
    supabaseReachable &&
    userSessionsTable &&
    profilesTable;

  if (ok) {
    hints.push("Connection looks good. Signup should write to the profiles table.");
  }

  return {
    ok,
    timestamp: new Date().toISOString(),
    checks: {
      useDatabaseFlag,
      supabaseUrlSet,
      serviceRoleKeySet,
      supabaseUrlFormat,
      supabaseReachable,
      userSessionsTable,
      profilesTable,
    },
    errors,
    hints,
    urlPreview: getUrlPreview(),
  };
}
