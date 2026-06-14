export function isServerDatabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

/** True when the app should use Supabase (client + server). */
export function isDatabaseEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_DATABASE === "true" &&
    isServerDatabaseConfigured()
  );
}
