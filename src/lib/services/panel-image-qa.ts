import {
  costOpenAIChatTokens,
  costOpenAIImageUsage,
  summarizeUsage,
  type ApiUsageSummary,
} from "@/lib/api-usage-cost";
import {
  getPanelContext,
  insertPanelReview,
  listApprovedPromptExamples,
  listCommonIssues,
  updatePanelFields,
} from "@/lib/services/pipeline-panels-repository";
import { persistPipelinePanelArt } from "@/lib/services/comic-art-storage";
import { enforceCaptionBoxRules } from "@/lib/prompts/caption-box-rules";
import {
  isImageSafetyViolation,
  softenImagePromptForSafety,
} from "@/lib/prompts/image-safety";
import { hasOpenAIKey, requireOpenAIKey } from "@/lib/engine/openai-client";
import { parseJsonFromModel } from "@/lib/parseModelJson";
import type { CreatorAdminPanel, ImageQaResult } from "@/types/creator-admin";

const QA_PASS_THRESHOLD = 75;

const IMAGE_QA_PROMPT = `You are a comic art quality reviewer for Toonlora, a cinematic business graphic novel platform.

IMPORTANT — baked-in text is intentional:
- Panels include cream/parchment narration boxes with captions and speech bubbles with dialogue.
- Text in the image is CORRECT and desired. Never penalize or list issues for text being present.
- Never flag caption boxes, speech bubbles, narration placement, or spelling/typos in captions.

Score the panel image against these criteria (0-100 overall):
1. Ultra-realistic cinematic graphic novel style: high contrast, film lighting, gritty documentary drama
2. Composition readable on mobile (clear focal point, not cluttered)
3. Matches the visual description and script context (scene, characters, era)
4. Era/setting accuracy (wardrobe, architecture, technology)
5. Caption/dialogue text roughly matches the script (presence of text is fine; ignore spelling)
6. No obvious AI artifacts (extra limbs, melted faces, duplicate characters)
7. No unwanted watermarks, platform logos, or random gibberish text unrelated to the script

Return ONLY JSON:
{
  "score": number,
  "passed": boolean,
  "issues": string[],
  "summary": string,
  "prompt_fix": string | null
}

Set passed=true only if score >= 75 and no critical issues (wrong scene, broken anatomy, unwanted watermarks).
Never include text-presence or caption-spelling issues in the issues array.
prompt_fix should be a short paragraph to APPEND to the image prompt to fix visual/scene issues only. Null if passed.`;

/** Strip false positives the model may still emit about intentional in-image text. */
function isIntentionalTextIssue(issue: string): boolean {
  const lower = issue.toLowerCase();
  const blocked = [
    "readable text",
    "text in the image",
    "text in image",
    "text present",
    "speech bubble",
    "caption box",
    "caption in",
    "parchment",
    "narration box",
    "lettering",
    "spelling",
    "misspell",
    "typo",
    "misspelled",
    "words in the image",
    "text visible",
  ];
  return blocked.some((phrase) => lower.includes(phrase));
}

function filterQaIssues(issues: string[]): string[] {
  return issues.filter((issue) => !isIntentionalTextIssue(issue));
}

function parseJsonResponse<T>(raw: string): T {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("QA model returned invalid JSON");
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as T;
}

async function callOpenAIVision(params: {
  prompt: string;
  imageUrl: string;
}): Promise<{ content: string; usage: ApiUsageSummary }> {
  requireOpenAIKey();
  const model = process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: params.prompt },
            { type: "image_url", image_url: { url: params.imageUrl, detail: "high" } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Vision QA failed: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) throw new Error("Vision QA returned empty response");

  const inputTokens = data.usage?.prompt_tokens ?? 0;
  const outputTokens = data.usage?.completion_tokens ?? 0;
  const usage = summarizeUsage([
    costOpenAIChatTokens(model, inputTokens, outputTokens, "vision_qa"),
  ]);

  return { content, usage };
}

async function generatePanelImage(
  prompt: string,
  options: {
    onSafetyViolation?: (info: {
      attempt: number;
      maxAttempts: number;
    }) => void | Promise<void>;
  } = {}
): Promise<{
  url: string;
  usage: ApiUsageSummary;
}> {
  requireOpenAIKey();

  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const attemptPrompt =
      attempt === 0 ? prompt : softenImagePromptForSafety(prompt, attempt);

    try {
      return await generatePanelImageOnce(attemptPrompt);
    } catch (err) {
      lastError = err;
      if (!isImageSafetyViolation(err) || attempt === maxAttempts - 1) {
        throw err;
      }
      await options.onSafetyViolation?.({
        attempt: attempt + 1,
        maxAttempts: maxAttempts - 1,
      });
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function generatePanelImageOnce(prompt: string): Promise<{
  url: string;
  usage: ApiUsageSummary;
}> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: enforceCaptionBoxRules(prompt),
      size: "1024x1536",
      quality: "high",
      n: 1,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Image generation failed: ${err}`);
  }

  const data = await response.json();
  const item = data.data?.[0];
  const url = item?.url as string | undefined;
  const b64 = item?.b64_json as string | undefined;
  const usage = summarizeUsage([costOpenAIImageUsage(data.usage ?? {})]);
  if (url) return { url, usage };
  if (b64) return { url: `data:image/png;base64,${b64}`, usage };
  throw new Error("Image model returned no image data");
}

function buildQaContext(panel: CreatorAdminPanel, seriesTitle: string, category: string | null): string {
  return `${IMAGE_QA_PROMPT}

Series: ${seriesTitle}
Category: ${category ?? "general"}
Episode ${panel.episode_number}: ${panel.episode_title}
Panel ${panel.panel_number} (chapter ${panel.chapter_number})

Visual description: ${panel.visual_description ?? "—"}
Caption: ${panel.caption ?? "—"}
Dialogue: ${panel.dialogue ?? "—"}
Image prompt used: ${panel.image_prompt ?? "—"}`;
}

function normalizeQaResult(raw: Partial<ImageQaResult>): ImageQaResult {
  const score =
    typeof raw.score === "number"
      ? Math.min(100, Math.max(0, Math.round(raw.score)))
      : 50;
  const issues = filterQaIssues(
    Array.isArray(raw.issues)
      ? raw.issues.filter((i): i is string => typeof i === "string")
      : []
  );

  const passed =
    typeof raw.passed === "boolean"
      ? raw.passed && issues.length === 0
      : score >= QA_PASS_THRESHOLD && issues.length === 0;

  return {
    score,
    passed,
    issues,
    summary: typeof raw.summary === "string" ? raw.summary : "No summary",
    prompt_fix:
      typeof raw.prompt_fix === "string" && raw.prompt_fix.trim() && !passed
        ? raw.prompt_fix.trim()
        : null,
  };
}

export async function runPanelImageQa(panelId: string): Promise<{
  panel: CreatorAdminPanel;
  result: ImageQaResult;
  review: Awaited<ReturnType<typeof insertPanelReview>>;
  usage: ApiUsageSummary;
}> {
  if (!hasOpenAIKey()) {
    throw new Error("OPENAI_API_KEY is required for image QA");
  }

  const context = await getPanelContext(panelId);
  if (!context) throw new Error("Panel not found");
  if (!context.panel.image_url) {
    throw new Error("Panel has no image to review");
  }

  const { content, usage } = await callOpenAIVision({
    prompt: buildQaContext(context.panel, context.seriesTitle, context.category),
    imageUrl: context.panel.image_url,
  });

  const result = normalizeQaResult(
    parseJsonFromModel<Partial<ImageQaResult>>(content)
  );

  const review = await insertPanelReview({
    panel_id: panelId,
    review_type: "ai",
    score: result.score,
    passed: result.passed,
    issues: result.issues,
    summary: result.summary,
    prompt_fix: result.prompt_fix,
    human_rating: null,
    feedback_note: null,
    prompt_used: context.panel.image_prompt,
    image_url: context.panel.image_url,
  });

  const updated = await getPanelContext(panelId);
  return {
    panel: updated!.panel,
    result,
    review,
    usage,
  };
}

export async function saveHumanPanelFeedback(
  panelId: string,
  params: { rating: "approve" | "reject"; note?: string }
): Promise<CreatorAdminPanel> {
  const context = await getPanelContext(panelId);
  if (!context) throw new Error("Panel not found");

  await insertPanelReview({
    panel_id: panelId,
    review_type: "human",
    score: null,
    passed: params.rating === "approve",
    issues: [],
    summary:
      params.rating === "approve"
        ? "Approved by reviewer"
        : "Rejected by reviewer",
    prompt_fix: null,
    human_rating: params.rating,
    feedback_note: params.note?.trim() || null,
    prompt_used: context.panel.image_prompt,
    image_url: context.panel.image_url,
  });

  if (params.rating === "approve") {
    await updatePanelFields(panelId, { status: "approved" });
  } else {
    await updatePanelFields(panelId, { status: "needs_fix" });
  }

  const updated = await getPanelContext(panelId);
  return updated!.panel;
}

function buildRegenerationPrompt(
  basePrompt: string,
  options: {
    applyAiFix?: boolean;
    promptFix?: string | null;
    extraInstructions?: string;
  }
): string {
  const parts = [basePrompt.trim()];

  if (options.applyAiFix && options.promptFix?.trim()) {
    parts.push(`Fix these issues: ${options.promptFix.trim()}`);
  }

  if (options.extraInstructions?.trim()) {
    parts.push(options.extraInstructions.trim());
  }

  return parts.filter(Boolean).join("\n\n");
}

export async function regeneratePanelImage(
  panelId: string,
  options: {
    prompt?: string;
    applyAiFix?: boolean;
    autoReview?: boolean;
  } = {}
): Promise<{
  panel: CreatorAdminPanel;
  qa?: ImageQaResult;
  usage: ApiUsageSummary;
}> {
  if (!hasOpenAIKey()) {
    throw new Error("OPENAI_API_KEY is required for image generation");
  }

  const context = await getPanelContext(panelId);
  if (!context) throw new Error("Panel not found");

  const basePrompt = options.prompt?.trim() || context.panel.image_prompt;
  if (!basePrompt) throw new Error("Panel has no image prompt");

  const approvedExamples = await listApprovedPromptExamples(context.category, 3);
  const commonIssues = filterQaIssues(await listCommonIssues(5));

  let enrichedPrompt = enforceCaptionBoxRules(
    buildRegenerationPrompt(basePrompt, {
      applyAiFix: options.applyAiFix,
      promptFix: context.panel.latest_ai_review?.prompt_fix,
    })
  );

  if (commonIssues.length > 0) {
    enrichedPrompt += `\n\nAvoid these common problems: ${commonIssues.join("; ")}.`;
  }

  if (approvedExamples.length > 0) {
    enrichedPrompt += `\n\nMatch the quality of approved panels. Example approved prompt style: ${approvedExamples[0].image_prompt.slice(0, 400)}`;
  }

  const initialPrompt = enrichedPrompt;

  await updatePanelFields(panelId, {
    image_prompt: options.prompt?.trim() || basePrompt,
    status: "generating",
  });

  const { url: tempUrl, usage: imageUsage } = await generatePanelImage(
    initialPrompt,
    {
      onSafetyViolation: async ({ attempt }) => {
        const softened = softenImagePromptForSafety(initialPrompt, attempt);
        await updatePanelFields(panelId, {
          image_prompt: softened,
          status: "safety_violation",
        });
      },
    }
  );
  const publicUrl = await persistPipelinePanelArt(
    tempUrl,
    context.seriesId,
    panelId
  );

  await updatePanelFields(panelId, {
    image_url: publicUrl,
    status: "complete",
  });

  if (options.autoReview) {
    const qaRun = await runPanelImageQa(panelId);
    return {
      panel: qaRun.panel,
      qa: qaRun.result,
      usage: summarizeUsage([...imageUsage.items, ...qaRun.usage.items]),
    };
  }

  const updated = await getPanelContext(panelId);
  return { panel: updated!.panel, usage: imageUsage };
}
