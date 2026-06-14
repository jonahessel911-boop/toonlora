import { IMAGE_GRADIENTS } from "@/lib/constants";
import type {
  ComicPage,
  ContinuityMemory,
  EpisodeScript,
  ImagePromptResult,
  PanelBreakdown,
  SeriesInput,
  StoryBible,
  TextOverlay,
} from "@/types/pipeline";
import { buildFinalImagePrompt } from "@/lib/prompts/image-prompt";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const PANEL_TYPES = [
  "establishing",
  "close-up",
  "reaction",
  "emotional",
  "action",
  "cliffhanger",
] as const;

const PANEL_COUNT: Record<SeriesInput["episode_length"], number> = {
  Short: 5,
  Normal: 6,
  Long: 7,
};

export function mockModeration(_input: SeriesInput): { passed: true } {
  return { passed: true };
}

export function mockStoryBible(input: SeriesInput): StoryBible {
  const mc = input.main_character;
  const li = input.love_interest;

  return {
    series_title: `${mc} & the Secret of ${li}`,
    logline: input.story_idea,
    genre: input.genre,
    tone: input.tone,
    target_audience: input.target_audience,
    visual_style: input.style,
    main_characters: [
      {
        name: mc,
        role: "Protagonist",
        age_range: "16-18",
        personality: "Shy, observant, kind-hearted with hidden courage",
        visual_design: `Soft features, expressive eyes, ${input.style} proportions`,
        signature_outfit: "School uniform with a green ribbon accessory",
        emotional_arc: "From insecurity to brave honesty",
      },
      {
        name: li,
        role: "Love interest",
        age_range: "16-18",
        personality: "Calm exterior, guarded secrets, fiercely loyal",
        visual_design: "Sharp eyes, dark hair, elegant posture",
        signature_outfit: "Dark jacket over school uniform",
        emotional_arc: "From isolation to trusting someone",
      },
    ],
    world: {
      setting: "A modern academy where ordinary life hides supernatural secrets",
      mood: input.tone,
      important_locations: [
        "Moonlight Academy rooftop",
        "Old library annex",
        "Cherry blossom courtyard",
      ],
    },
    story_rules: [
      "Keep romance emotional, not explicit",
      "Reveal supernatural elements gradually",
      "Every episode ends on a cliffhanger",
      "Dialogue stays short and readable",
    ],
    season_arc: `${mc} discovers ${li}'s hidden identity and must choose between fear and love`,
    episode_1_hook: input.story_idea,
    recurring_conflict: "Trust vs. secrets — can love survive the truth?",
    visual_keywords: [
      "vertical webtoon",
      "soft lighting",
      "emotional close-ups",
      "school fantasy",
      input.style.toLowerCase(),
    ],
  };
}

export function mockEpisodeScript(
  input: SeriesInput,
  bible: StoryBible,
  episodeNumber = 1
): EpisodeScript {
  const mc = input.main_character;
  const li = input.love_interest;
  const count = PANEL_COUNT[input.episode_length];

  const panelTemplates = [
    {
      panel_type: "establishing" as const,
      visual_description: `Wide shot of Moonlight Academy at dusk, cherry blossoms drifting. ${mc} walks alone with books.`,
      camera_angle: "Wide establishing shot, slightly low angle",
      character_emotion: "Quiet, thoughtful",
      background: "Academy gates, golden sunset",
      dialogue: [] as { speaker: string; text: string }[],
      narration: "Some secrets change everything the moment you notice them.",
      sfx: "rustle",
    },
    {
      panel_type: "close-up" as const,
      visual_description: `${mc} glances up and freezes — ${li} stands under the archway, eyes glowing faintly silver.`,
      camera_angle: "Close-up on MC's widened eyes",
      character_emotion: "Shock, disbelief",
      background: "Blurred academy corridor",
      dialogue: [{ speaker: mc, text: `${li}…? Your eyes—` }],
      narration: "",
      sfx: "",
    },
    {
      panel_type: "reaction" as const,
      visual_description: `${li} steps back, shadows curling around his silhouette like smoke.`,
      camera_angle: "Medium shot, dramatic side lighting",
      character_emotion: "Conflicted, vulnerable",
      background: "Darkening hallway",
      dialogue: [
        { speaker: li, text: "You weren't supposed to see this." },
      ],
      narration: "",
      sfx: "whisper",
    },
    {
      panel_type: "emotional" as const,
      visual_description: `${mc} reaches forward despite fear. Their hands almost touch.`,
      camera_angle: "Intimate two-shot, shallow depth",
      character_emotion: "Trembling courage",
      background: "Fading cherry blossom petals",
      dialogue: [
        { speaker: mc, text: "Tell me the truth. Please." },
      ],
      narration: "",
      sfx: "",
    },
    {
      panel_type: "action" as const,
      visual_description: `A crack of crimson light erupts behind ${li}. He transforms — horns silhouette, crown shadow.`,
      camera_angle: "Dynamic low angle",
      character_emotion: "Power restrained, pain",
      background: "Supernatural energy burst",
      dialogue: [{ speaker: li, text: `I'm not human, ${mc}.` }],
      narration: "",
      sfx: "CRACK",
    },
    {
      panel_type: "emotional" as const,
      visual_description: `Tears on ${mc}'s face. She doesn't run.`,
      camera_angle: "Extreme close-up",
      character_emotion: "Heartbreak and wonder",
      background: "Soft green glow",
      dialogue: [{ speaker: mc, text: "…Then who are you to me?" }],
      narration: "",
      sfx: "",
    },
    {
      panel_type: "cliffhanger" as const,
      visual_description: `${li} extends a hand wreathed in shadow. ${mc} must choose.`,
      camera_angle: "Silhouette wide shot, moon rising",
      character_emotion: "Desperate hope",
      background: "Rooftop under full moon",
      dialogue: [{ speaker: li, text: "Come with me. Before they find us." }],
      narration: "To be continued…",
      sfx: "",
    },
  ];

  const panels = panelTemplates.slice(0, count).map((p, i) => ({
    panel_number: i + 1,
    ...p,
  }));

  return {
    episode_title: `Episode ${episodeNumber}: The Secret Under Moonlight`,
    episode_number: episodeNumber,
    episode_summary: `${mc} discovers ${li}'s supernatural identity and faces an impossible choice.`,
    emotional_goal: "Shock turning into fragile trust",
    cliffhanger: `${li} offers his hand as shadow hunters close in`,
    panels,
  };
}

export function mockPanelBreakdown(script: EpisodeScript): PanelBreakdown {
  const zones = ["top", "upper-mid", "mid", "lower-mid", "bottom", "bottom", "bottom"];

  return {
    episode_number: script.episode_number,
    panel_count: script.panels.length,
    panels: script.panels.map((p, i) => ({
      panel_number: p.panel_number,
      layout_zone: zones[i] ?? "mid",
      visual: p.visual_description,
      emotion: p.character_emotion,
      dialogue_text: p.dialogue.map((d) => `${d.speaker}: ${d.text}`).join(" / "),
      narration_text: p.narration,
      sfx_text: p.sfx,
      camera: p.camera_angle,
      background: p.background,
    })),
  };
}

export function mockImagePrompt(
  bible: StoryBible,
  script: EpisodeScript,
  breakdown: PanelBreakdown
): ImagePromptResult {
  const characterBible = bible.main_characters
    .map(
      (c) =>
        `${c.name}: ${c.visual_design}. Outfit: ${c.signature_outfit}.`
    )
    .join("\n");

  const prompt = buildFinalImagePrompt({
    episodeNumber: script.episode_number,
    seriesTitle: bible.series_title,
    characterBible,
    episodeSummary: script.episode_summary,
    panels: breakdown.panels.map((p) => ({
      visual: p.visual,
      emotion: p.emotion,
      text: p.dialogue_text || p.narration_text || p.sfx_text,
    })),
    cliffhanger: script.cliffhanger,
  });

  return {
    prompt,
    art_style: bible.visual_style,
    panel_count: breakdown.panel_count,
  };
}

export function mockComicPage(
  script: EpisodeScript,
  _imagePrompt: ImagePromptResult
): ComicPage {
  return {
    episode_number: script.episode_number,
    artUrl: null,
    artGradient: pickRandom(IMAGE_GRADIENTS),
    width: 800,
    height: 2400,
    noTextInImage: true,
  };
}

export function mockImageQA(_comicPage: ComicPage): {
  passed: boolean;
  notes: string[];
} {
  return {
    passed: true,
    notes: [
      "Character silhouettes consistent",
      "Panel layout readable",
      "No text detected in image (correct)",
    ],
  };
}

export function mockTextOverlay(
  script: EpisodeScript,
  _breakdown: PanelBreakdown
): TextOverlay {
  const bubblePositions = [
    { x: 55, y: 15, width: 42 },
    { x: 20, y: 25, width: 45 },
    { x: 50, y: 20, width: 40 },
    { x: 30, y: 18, width: 50 },
    { x: 60, y: 22, width: 38 },
    { x: 25, y: 20, width: 48 },
    { x: 45, y: 12, width: 44 },
  ];

  return {
    episode_number: script.episode_number,
    panels: script.panels.map((panel, i) => {
      const bubbles: TextOverlay["panels"][0]["bubbles"] = [];
      const pos = bubblePositions[i] ?? bubblePositions[0];

      if (panel.narration) {
        bubbles.push({
          type: "narration",
          speaker: "",
          text: panel.narration,
          position: { x: 50, y: 8, width: 85 },
        });
      }

      panel.dialogue.forEach((d, di) => {
        bubbles.push({
          type: "speech",
          speaker: d.speaker,
          text: d.text,
          position: {
            x: pos.x + di * 5,
            y: pos.y + di * 8,
            width: pos.width,
          },
          tail_direction: di % 2 === 0 ? "bottom-left" : "bottom-right",
        });
      });

      if (panel.sfx) {
        bubbles.push({
          type: "sfx",
          speaker: "",
          text: panel.sfx,
          position: { x: 70, y: 40, width: 25 },
        });
      }

      return { panel_number: panel.panel_number, bubbles };
    }),
  };
}

export function mockContinuityMemory(
  bible: StoryBible,
  script: EpisodeScript
): ContinuityMemory {
  const mc = bible.main_characters[0]?.name ?? "MC";
  const li = bible.main_characters[1]?.name ?? "LI";

  return {
    series_title: bible.series_title,
    last_episode_number: script.episode_number,
    last_episode_summary: script.episode_summary,
    character_states: {
      [mc]: "Knows LI's secret identity; conflicted but drawn to him",
      [li]: "Secret exposed; vulnerable; offered escape",
    },
    unresolved_threads: [
      script.cliffhanger,
      "Who are the shadow hunters?",
      "Will MC accept the supernatural world?",
    ],
    visual_consistency_notes: bible.main_characters.map(
      (c) => `${c.name}: ${c.visual_design}, ${c.signature_outfit}`
    ),
  };
}
