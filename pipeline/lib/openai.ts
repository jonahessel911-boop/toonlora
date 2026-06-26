import OpenAI from "openai";
import { enforceCaptionBoxRules } from "../../src/lib/prompts/caption-box-rules.js";
import {
  isImageSafetyViolation,
  softenImagePromptForSafety,
} from "../../src/lib/prompts/image-safety.js";
import { requireEnv } from "./config.js";
import { getSupabase } from "./supabase.js";
import { getStepUsage } from "./usage.js";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
  }
  return client;
}

export interface GeneratedImageResult {
  url: string;
  usage?: OpenAI.Images.ImagesResponse.Usage;
  hadSafetyViolation?: boolean;
}

export interface GenerateDalleImageOptions {
  /** Called when OpenAI rejects for safety — before auto-retry with softened prompt. */
  onSafetyViolation?: (info: {
    attempt: number;
    maxAttempts: number;
  }) => void | Promise<void>;
}

export async function generateDalleImage(
  prompt: string,
  options: GenerateDalleImageOptions = {}
): Promise<GeneratedImageResult> {
  const maxAttempts = 3;
  let lastError: unknown;
  let hadSafetyViolation = false;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const attemptPrompt =
      attempt === 0
        ? prompt
        : softenImagePromptForSafety(prompt, attempt);

    try {
      const result = await generateDalleImageOnce(attemptPrompt);
      return { ...result, hadSafetyViolation };
    } catch (err) {
      lastError = err;
      if (!isImageSafetyViolation(err) || attempt === maxAttempts - 1) {
        throw err;
      }
      hadSafetyViolation = true;
      await options.onSafetyViolation?.({
        attempt: attempt + 1,
        maxAttempts: maxAttempts - 1,
      });
      console.warn(
        `[openai] Violation detected — auto-retry ${attempt + 1}/${maxAttempts - 1} with softened prompt`
      );
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function generateDalleImageOnce(prompt: string): Promise<GeneratedImageResult> {
  const openai = getOpenAI();

  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt: enforceCaptionBoxRules(prompt),
    size: "1024x1536",
    quality: "high",
  });

  const imageData = response.data?.[0];

  if (!imageData) {
    throw new Error("No image data returned from gpt-image-1");
  }

  getStepUsage()?.recordOpenAIImage(response.usage, "image_generation");

  if (imageData.url) {
    return { url: imageData.url, usage: response.usage };
  } else if (imageData.b64_json) {
    return { url: imageData.b64_json, usage: response.usage };
  }

  throw new Error("No image data returned from gpt-image-1");
}

export async function persistPanelImage(
  imageUrl: string,
  seriesId: string,
  panelId: string
): Promise<string> {
  const supabase = getSupabase();
  let bytes: Buffer;

  if (imageUrl.startsWith("data:image")) {
    const b64 = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    bytes = Buffer.from(b64, "base64");
  } else if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      throw new Error(`Failed to download generated image: ${res.status}`);
    }
    bytes = Buffer.from(await res.arrayBuffer());
  } else {
    bytes = Buffer.from(imageUrl, "base64");
  }
  const path = `pipeline/${seriesId}/${panelId}-${crypto.randomUUID()}.png`;

  const { error } = await supabase.storage
    .from("comic-art")
    .upload(path, bytes, { contentType: "image/png", upsert: false });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from("comic-art").getPublicUrl(path);
  return data.publicUrl;
}
