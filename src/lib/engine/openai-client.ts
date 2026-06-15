/**
 * OpenAI client — story generation requires OPENAI_API_KEY in .env.local
 */

import { persistComicArt } from "@/lib/services/comic-art-storage";

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function requireOpenAIKey(): void {
  if (!hasOpenAIKey()) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add your OpenAI API key to .env.local and restart the dev server."
    );
  }
}

export function getOpenAIChatModel(): string {
  return process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini";
}

export function getOpenAIImageModel(): string {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
}

const IMAGE_MODEL_FALLBACKS = ["gpt-image-1", "gpt-image-2", "dall-e-3"] as const;

function isGptImageModel(model: string): boolean {
  return model.startsWith("gpt-image");
}

function buildImageRequestBody(prompt: string, model: string): Record<string, unknown> {
  if (isGptImageModel(model)) {
    return {
      model,
      prompt,
      size: "1024x1536",
      quality: "high",
      output_format: "png",
      n: 1,
    };
  }

  if (model === "dall-e-2") {
    return {
      model,
      prompt,
      size: "1024x1024",
      n: 1,
    };
  }

  // dall-e-3
  return {
    model,
    prompt,
    size: "1024x1792",
    quality: "hd",
    n: 1,
  };
}

function imageModelsToTry(preferred: string): string[] {
  const ordered = [preferred, ...IMAGE_MODEL_FALLBACKS.filter((m) => m !== preferred)];
  return [...new Set(ordered)];
}

function isUnknownImageModelError(errText: string): boolean {
  return (
    errText.includes("does not exist") ||
    errText.includes("invalid_value") ||
    errText.includes("model_not_found")
  );
}

async function requestOpenAIImage(
  prompt: string,
  model: string
): Promise<{ b64?: string; url?: string }> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildImageRequestBody(prompt, model)),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const data = await response.json();
  return {
    b64: data.data?.[0]?.b64_json as string | undefined,
    url: data.data?.[0]?.url as string | undefined,
  };
}

export interface OpenAIChatOptions {
  model?: string;
  prompt: string;
  json?: boolean;
}

export async function callOpenAIChat(
  options: OpenAIChatOptions
): Promise<string> {
  requireOpenAIKey();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model ?? getOpenAIChatModel(),
      messages: [{ role: "user", content: options.prompt }],
      ...(options.json && {
        response_format: { type: "json_object" },
      }),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI chat failed: ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content ?? "";
  if (!content.trim()) {
    throw new Error("OpenAI returned an empty response");
  }
  return content;
}

export async function callOpenAIModeration(text: string): Promise<boolean> {
  requireOpenAIKey();

  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "omni-moderation-latest",
      input: text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI moderation failed: ${err}`);
  }

  const data = await response.json();
  return !data.results?.[0]?.flagged;
}

export async function callOpenAIImage(
  prompt: string,
  episodeNumber: number,
  model = getOpenAIImageModel()
): Promise<string> {
  requireOpenAIKey();

  let lastError = "OpenAI image generation failed";
  const models = imageModelsToTry(model);

  for (const candidate of models) {
    try {
      const { b64, url } = await requestOpenAIImage(prompt, candidate);
      if (!b64 && !url) {
        lastError = "OpenAI image generation returned no image data";
        continue;
      }
      return persistComicArt(
        b64 ? `data:image/png;base64,${b64}` : url!,
        episodeNumber
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      lastError = message;
      if (!isUnknownImageModelError(message)) {
        throw new Error(`OpenAI image generation failed: ${message}`);
      }
    }
  }

  throw new Error(`OpenAI image generation failed: ${lastError}`);
}
