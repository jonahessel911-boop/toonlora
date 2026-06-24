import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { updateAffiliate } from "@/lib/services/affiliate-repository";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const affiliate = await updateAffiliate(id, {
      slug: body.slug !== undefined ? String(body.slug) : undefined,
      name: body.name !== undefined ? String(body.name) : undefined,
      email: body.email !== undefined ? String(body.email) || null : undefined,
      company:
        body.company !== undefined ? String(body.company) || null : undefined,
      isActive:
        body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      paymentMethod:
        body.paymentMethod === "iban" || body.paymentMethod === "paypal"
          ? body.paymentMethod
          : body.paymentMethod === null
            ? null
            : undefined,
      paymentDetails:
        body.paymentDetails !== undefined ? body.paymentDetails : undefined,
      notes: body.notes !== undefined ? String(body.notes) || null : undefined,
    });

    return NextResponse.json({ affiliate });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update affiliate.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
