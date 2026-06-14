/**
 * OpenAI client wrapper — ready for when OPENAI_API_KEY is set.
 * Falls back to mock generators when no key is present.
 */

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export interface OpenAIChatOptions {
  model: string;
  prompt: string;
  json?: boolean;
}

export async function callOpenAIChat(
  options: OpenAIChatOptions
): Promise<string> {
  if (!hasOpenAIKey()) {
    throw new Error("OPENAI_API_KEY not configured — using mock pipeline");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      messages: [{ role: "user", content: options.prompt }],
      ...(options.json && {
        response_format: { type: "json_object" },
      }),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

export async function callOpenAIModeration(text: string): Promise<boolean> {
  if (!hasOpenAIKey()) return true;

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

  if (!response.ok) return true;
  const data = await response.json();
  return !data.results?.[0]?.flagged;
}

export async function callOpenAIImage(
  prompt: string,
  _model = "gpt-image-2"
): Promise<string | null> {
  if (!hasOpenAIKey()) return null;

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: _model,
      prompt,
      size: "1024x1792",
      quality: "high",
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.data?.[0]?.url ?? data.data?.[0]?.b64_json ?? null;
}
