import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "comic-art";

/** Upload generated comic art to Supabase Storage and return a permanent public URL. */
export async function persistComicArt(
  imageData: string,
  episodeNumber: number
): Promise<string> {
  return persistImageToBucket(imageData, `episodes/${crypto.randomUUID()}-ep${episodeNumber}.png`);
}

/** Upload character portrait PNG to Supabase Storage. */
export async function persistCharacterPortrait(
  imageData: string,
  characterId: string
): Promise<string> {
  return persistImageToBucket(
    imageData,
    `characters/${characterId}-${crypto.randomUUID()}.png`
  );
}

/** Upload creator studio panel art. */
export async function persistStudioPanelArt(
  imageData: string,
  storyId: string,
  panelId: string
): Promise<string> {
  return persistImageToBucket(
    imageData,
    `studio/${storyId}/${panelId}-${crypto.randomUUID()}.png`
  );
}

/** Upload admin-provided panel image bytes. */
export async function persistAdminPanelUpload(
  bytes: Buffer,
  contentType: string,
  storyId: string,
  panelOrder: number
): Promise<string> {
  const ext = contentType.includes("jpeg")
    ? "jpg"
    : contentType.includes("webp")
      ? "webp"
      : "png";
  return persistImageToBucket(
    bytes,
    `uploads/${storyId}/panel-${String(panelOrder).padStart(3, "0")}.${ext}`,
    contentType
  );
}

async function persistImageToBucket(
  imageData: string | Buffer,
  path: string,
  contentType = "image/png"
): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    if (typeof imageData === "string") return imageData;
    throw new Error("Database not configured for image upload");
  }

  let bytes: Buffer;
  if (Buffer.isBuffer(imageData)) {
    bytes = imageData;
  } else if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
    const res = await fetch(imageData);
    if (!res.ok) throw new Error("Failed to download generated image");
    bytes = Buffer.from(await res.arrayBuffer());
  } else {
    const b64 = imageData.replace(/^data:image\/\w+;base64,/, "");
    bytes = Buffer.from(b64, "base64");
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to store comic art: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
