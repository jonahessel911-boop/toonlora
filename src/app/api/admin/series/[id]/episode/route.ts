import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { persistAdminPanelUpload } from "@/lib/services/comic-art-storage";
import { getStoryFromDb, updateAdminStoryEpisode } from "@/lib/services/story-repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

type PanelSlot =
  | { type: "existing"; url: string }
  | { type: "new"; index: number };

function parseFeaturedRank(value: FormDataEntryValue | null): number | null {
  if (!value || typeof value !== "string" || !value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parsePanelSlots(raw: string): PanelSlot[] {
  const parsed = JSON.parse(raw) as PanelSlot[];
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Panel order is required");
  }
  return parsed;
}

async function resolvePanelUrls(
  slots: PanelSlot[],
  newFiles: File[],
  storyId: string
): Promise<string[]> {
  const urls: string[] = [];
  let newFileCursor = 0;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot.type === "existing") {
      if (!slot.url?.trim()) {
        throw new Error(`Panel ${i + 1} is missing an image URL`);
      }
      urls.push(slot.url.trim());
      continue;
    }

    const file = newFiles[slot.index];
    if (!file || !(file instanceof File) || file.size === 0) {
      throw new Error(`New panel file missing for slot ${i + 1}`);
    }
    if (!file.type.startsWith("image/")) {
      throw new Error(`File "${file.name}" is not an image`);
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const url = await persistAdminPanelUpload(
      bytes,
      file.type || "image/png",
      storyId,
      i + 1
    );
    urls.push(url);
    newFileCursor += 1;
  }

  if (newFileCursor !== newFiles.length) {
    throw new Error("Uploaded files do not match panel order");
  }

  return urls;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id: storyId } = await params;

  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const genre = String(formData.get("genre") ?? "").trim();
    const synopsis = String(formData.get("synopsis") ?? "").trim();
    const creatorDisplayName =
      String(formData.get("creator_display_name") ?? "").trim() ||
      "Toonlora Official";
    const coverGradient = String(formData.get("cover_gradient") ?? "").trim();
    const episodeNumber = Number(formData.get("episode_number") ?? 1) || 1;
    const featuredRank = parseFeaturedRank(formData.get("featured_rank"));
    const panelsRaw = String(formData.get("panels") ?? "");

    if (!title || !genre || !synopsis) {
      return NextResponse.json(
        { error: "Title, genre, and description are required." },
        { status: 400 }
      );
    }
    if (!panelsRaw) {
      return NextResponse.json(
        { error: "Panel order is required." },
        { status: 400 }
      );
    }

    const story = await getStoryFromDb(storyId);
    if (!story) {
      return NextResponse.json({ error: "Series not found." }, { status: 404 });
    }

    const slots = parsePanelSlots(panelsRaw);
    const newFiles = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const panelImageUrls = await resolvePanelUrls(slots, newFiles, storyId);

    const updated = await updateAdminStoryEpisode(storyId, {
      title,
      genre,
      synopsis,
      creatorDisplayName,
      coverGradient: coverGradient || story.coverGradient,
      featuredRank,
      episodeNumber,
      panelImageUrls,
    });

    return NextResponse.json({
      story: updated,
      panelCount: panelImageUrls.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 }
    );
  }
}
