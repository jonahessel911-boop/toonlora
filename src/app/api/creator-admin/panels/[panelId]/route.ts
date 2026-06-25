import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import {
  getPanelById,
  updatePanelFields,
} from "@/lib/services/pipeline-panels-repository";

interface RouteContext {
  params: Promise<{ panelId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const { panelId } = await context.params;
    const panel = await getPanelById(panelId);
    if (!panel) {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }
    return NextResponse.json({ panel });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load panel" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const { panelId } = await context.params;
    const body = (await request.json()) as {
      image_prompt?: string;
      visual_description?: string;
    };

    const patch: {
      image_prompt?: string;
      visual_description?: string;
    } = {};

    if (typeof body.image_prompt === "string") {
      patch.image_prompt = body.image_prompt;
    }
    if (typeof body.visual_description === "string") {
      patch.visual_description = body.visual_description;
    }

    if (!Object.keys(patch).length) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await updatePanelFields(panelId, patch);
    const panel = await getPanelById(panelId);
    return NextResponse.json({ panel });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update panel" },
      { status: 500 }
    );
  }
}
