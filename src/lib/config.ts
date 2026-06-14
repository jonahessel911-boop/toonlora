export function isDatabaseEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_DATABASE === "true";
}

export function isServerDatabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
