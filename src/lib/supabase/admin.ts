import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { isServerDatabaseConfigured } from "@/lib/config";

let adminClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client (service role).
 * All DB writes go through API routes using this client.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isServerDatabaseConfigured()) return null;

  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return adminClient;
}
