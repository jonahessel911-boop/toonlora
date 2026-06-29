import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { deleteAdminUser } from "@/lib/services/admin-users-repository";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const { id } = await params;
    if (!id?.trim()) {
      return NextResponse.json({ error: "User id required" }, { status: 400 });
    }

    await deleteAdminUser(id.trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    const status = message === "User not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
