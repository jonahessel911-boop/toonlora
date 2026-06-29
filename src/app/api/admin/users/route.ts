import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { listAdminUsers } from "@/lib/services/admin-users-repository";

export async function GET() {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const users = await listAdminUsers();
    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list users" },
      { status: 500 }
    );
  }
}
