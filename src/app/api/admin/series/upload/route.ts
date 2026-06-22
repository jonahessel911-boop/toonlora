import { NextResponse } from "next/server";
import { buildUploadedStory } from "@/lib/admin/uploadedStoryBuilder";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { persistAdminPanelUpload } from "@/lib/services/comic-art-storage";
import { saveStoryToDb } from "@/lib/services/story-repository";

const GRADIENTS = [
  "from-[#5340FF] via-[#7C3AED] to-[#FF4FA3]",
  "from-[#FF6847] via-[#FF4FA3] to-[#5340FF]",
  "from-[#22D3EE] via-[#5340FF] to-[#2A114B]",
  "from-[#FFE033] via-[#FF6847] to-[#FBBF24]",
];

function parseFeaturedRank(value: FormDataEntryValue | null): number | null {
  if (!value || typeof value !== "string" || !value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const genre = String(formData.get("genre") ?? "Fantasy").trim();
    const synopsis = String(formData.get("synopsis") ?? "").trim();
    const creatorDisplayName =
      String(formData.get("creator_display_name") ?? "Toonlora Official").trim() ||
      "Toonlora Official";
    const coverGradient =
      String(formData.get("cover_gradient") ?? "").trim() || GRADIENTS[0];
    const publish = formData.get("publish") !== "false";
    const featuredRank = parseFeaturedRank(formData.get("featured_rank"));

    const imageFiles = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!synopsis) {
      return NextResponse.json(
        { error: "Description / synopsis is required." },
        { status: 400 }
      );
    }
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: "Upload at least one panel image." },
        { status: 400 }
      );
    }

    const storyId = crypto.randomUUID();
    const panelImageUrls: string[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: `File "${file.name}" is not an image.` },
          { status: 400 }
        );
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      const url = await persistAdminPanelUpload(
        bytes,
        file.type || "image/png",
        storyId,
        i + 1
      );
      panelImageUrls.push(url);
    }

    const story = buildUploadedStory({
      id: storyId,
      title,
      genre,
      synopsis,
      coverGradient,
      creatorDisplayName,
      panelImageUrls,
    });

    const sessionId = getSessionFromRequest(request);
    const saved = await saveStoryToDb(story, sessionId, {
      source: "admin",
      status: publish ? "published" : "draft",
      isPublic: publish,
      synopsis,
      creatorDisplayName,
      featuredRank,
    });

    return NextResponse.json({
      story: saved,
      published: publish,
      panelCount: panelImageUrls.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
