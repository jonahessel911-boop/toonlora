import { IMAGE_DELAY_MS } from "../lib/config.js";
import { delay } from "../lib/json.js";
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

        const { url: tempUrl } = await generateDalleImage(panel.image_prompt!);
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
        await updatePanel(panel.id, { status: "failed" });
        throw new Error(
          `Image generation failed for episode ${episode.episode_number} panel ${panel.panel_number}: ${message}`
        );
      }
    }

    console.log(
      `[imageGenerator] Episode ${episode.episode_number} complete`
    );
  }
}
