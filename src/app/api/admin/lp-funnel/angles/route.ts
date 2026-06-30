import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { upsertLpLanderAngleLabel } from "@/lib/services/analytics-repository";

export async function PATCH(request: Request) {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      reportKey?: string;
      label?: string;
    };

    const reportKey = body.reportKey?.trim();
    const label = body.label?.trim();

    if (!reportKey) {
      return NextResponse.json(
        { error: "reportKey is required." },
        { status: 400 }
      );
    }
    if (!label) {
      return NextResponse.json({ error: "label is required." }, { status: 400 });
    }

    await upsertLpLanderAngleLabel(reportKey, label);
    return NextResponse.json({ ok: true, reportKey, label });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to update lander angle label",
      },
      { status: 500 }
    );
  }
}
