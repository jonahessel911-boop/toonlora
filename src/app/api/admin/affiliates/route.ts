import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import {
  createAffiliate,
  listAffiliateApplications,
  listAffiliatesWithStats,
} from "@/lib/services/affiliate-repository";

export async function GET() {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const [affiliates, applications] = await Promise.all([
      listAffiliatesWithStats(),
      listAffiliateApplications(),
    ]);
    return NextResponse.json({ affiliates, applications });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load affiliates.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const affiliate = await createAffiliate({
      slug: String(body.slug ?? ""),
      name: String(body.name ?? ""),
      email: body.email ? String(body.email) : undefined,
      company: body.company ? String(body.company) : undefined,
      isActive: Boolean(body.isActive),
      paymentMethod:
        body.paymentMethod === "iban" || body.paymentMethod === "paypal"
          ? body.paymentMethod
          : null,
      paymentDetails: body.paymentDetails ?? {},
      notes: body.notes ? String(body.notes) : undefined,
      applicationId: body.applicationId ? String(body.applicationId) : undefined,
    });

    return NextResponse.json({ affiliate });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create affiliate.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
