import { IMAGE_DELAY_MS } from "../lib/config.js";
import { delay } from "../lib/json.js";
import { softenImagePromptForSafety } from "../../src/lib/prompts/image-safety.js";
import { generateDalleImage, persistPanelImage } from "../lib/openai.js";
import {
  listEpisodes,
  listPanelsForEpisode,
  updatePanel,
} from "../lib/supabase.js";

export async function runImageGenerator(
  seriesId: string,
  options: { episodeNumbers?: number[]; skipExisting?: boolean } = {}
): Promise<void> {
  const episodes = await listEpisodes(seriesId);
  const skipExisting = options.skipExisting !== false;

  const targets = options.episodeNumbers?.length
    ? episodes.filter((ep) => options.episodeNumbers!.includes(ep.episode_number))
    : episodes;

  for (const episode of targets) {
    const panels = await listPanelsForEpisode(episode.id);
    const toGenerate = panels.filter(
      (p) =>
        p.image_prompt &&
        (!skipExisting || !p.image_url)
    );

    if (toGenerate.length === 0) {
      console.log(
        `[imageGenerator] Episode ${episode.episode_number}: nothing to generate`
      );
      continue;
    }

    console.log(
      `[imageGenerator] Episode ${episode.episode_number}: ${toGenerate.length} panels…`
    );

    for (let i = 0; i < toGenerate.length; i++) {
      const panel = toGenerate[i];
      try {
        console.log(
          `[imageGenerator] Panel ${panel.panel_number}/${toGenerate.length}…`
        );

        await updatePanel(panel.id, { status: "generating" });

        const initialPrompt = panel.image_prompt!;

        const { url: tempUrl } = await generateDalleImage(initialPrompt, {
          onSafetyViolation: async ({ attempt, maxAttempts }) => {
            console.warn(
              `[imageGenerator] Violation detected — panel ${panel.panel_number}, retry ${attempt}/${maxAttempts}`
            );
            const softened = softenImagePromptForSafety(initialPrompt, attempt);
            await updatePanel(panel.id, {
              image_prompt: softened,
              status: "safety_violation",
            });
          },
        });
        const publicUrl = await persistPanelImage(
          tempUrl,
          seriesId,
          panel.id
        );

        await updatePanel(panel.id, {
          image_url: publicUrl,
          status: "complete",
        });

        if (i < toGenerate.length - 1) {
          await delay(IMAGE_DELAY_MS);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await updatePanel(panel.id, { status: "needs_fix" });
        console.warn(
          `[imageGenerator] Panel ${panel.panel_number} skipped (${message.slice(0, 120)}…) — continuing`
        );
      }
    }

    const remaining = (await listPanelsForEpisode(episode.id)).filter(
      (p) => p.image_prompt && !p.image_url
    );
    if (remaining.length > 0) {
      console.warn(
        `[imageGenerator] Episode ${episode.episode_number}: ${remaining.length} panel(s) still need images (safety or API error)`
      );
    } else {
      console.log(
        `[imageGenerator] Episode ${episode.episode_number} complete`
      );
    }
  }
}
