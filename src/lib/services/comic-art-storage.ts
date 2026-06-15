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

async function persistImageToBucket(
  imageData: string,
  path: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return imageData;

  let bytes: Buffer;
  if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
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
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to store comic art: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
