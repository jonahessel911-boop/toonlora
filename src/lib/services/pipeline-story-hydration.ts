import type { SupabaseClient } from "@supabase/supabase-js";
import type { StoryEpisode } from "@/types/story";

export interface PipelinePanelRow {
  episode_id: string;
  panel_number: number;
  chapter_number: number;
  visual_description: string | null;
  caption: string | null;
  dialogue: string | null;
  image_url: string | null;
}

export async function fetchPipelinePanelsForEpisodes(
  supabase: SupabaseClient,
  episodeIds: string[]
): Promise<PipelinePanelRow[]> {
  if (!episodeIds.length) return [];

  const { data, error } = await supabase
    .from("panels")
    .select(
      "episode_id, panel_number, chapter_number, visual_description, caption, dialogue, image_url"
    )
    .in("episode_id", episodeIds)
    .order("panel_number", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as PipelinePanelRow[];
}

export function hydrateEpisodesWithPipelinePanels(
  episodes: StoryEpisode[],
  panelRows: PipelinePanelRow[]
): StoryEpisode[] {
  const byEpisodeId = new Map<string, PipelinePanelRow[]>();
  for (const row of panelRows) {
    const list = byEpisodeId.get(row.episode_id) ?? [];
    list.push(row);
    byEpisodeId.set(row.episode_id, list);
  }

  return episodes.map((ep) => {
    const rows = (byEpisodeId.get(ep.id) ?? []).sort(
      (a, b) => a.panel_number - b.panel_number
    );
    if (!rows.length) return ep;

    const breakdownMap = new Map(
      (ep.panelBreakdown?.panels ?? []).map((panel) => [panel.panel_number, panel])
    );

    const mergedBreakdownPanels = rows.map((row) => {
      const existing = breakdownMap.get(row.panel_number);
      const artUrl = row.image_url ?? existing?.artUrl;
      if (existing) {
        return { ...existing, artUrl };
      }
      return {
        panel_number: row.panel_number,
        layout_zone: "full",
        visual: row.visual_description ?? "",
        emotion: "",
        dialogue_text: row.dialogue ?? "",
        narration_text: row.caption ?? "",
        sfx_text: "",
        camera: "",
        background: "",
        artUrl,
      };
    });

    const scriptPanels =
      ep.script?.panels?.length > 0
        ? ep.script.panels
        : rows.map((row) => ({
            panel_number: row.panel_number,
            panel_type: "establishing" as const,
            visual_description:
              row.visual_description ?? `Panel ${row.panel_number}`,
            camera_angle: "medium",
            character_emotion: "",
            background: "",
            dialogue: [],
            narration: row.caption ?? "",
            sfx: "",
          }));

    const firstImage = rows.find((row) => row.image_url)?.image_url ?? null;

    return {
      ...ep,
      panelBreakdown: {
        ...ep.panelBreakdown,
        episode_number: ep.episodeNumber,
        panel_count: Math.max(ep.panelBreakdown?.panel_count ?? 0, rows.length),
        panels: mergedBreakdownPanels,
      },
      script: {
        ...ep.script,
        episode_number: ep.episodeNumber,
        episode_title: ep.script?.episode_title ?? ep.title,
        panels: scriptPanels,
      },
      comicPage: {
        ...ep.comicPage,
        artUrl: ep.comicPage?.artUrl ?? firstImage,
      },
    };
  });
}
