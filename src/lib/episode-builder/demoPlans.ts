import type { EpisodeBuilderInput, EpisodeStoryPlan } from "@/types/episode-builder";
import { EPISODE_BUILDER_PRESETS } from "@/lib/episode-builder/constants";
import { rawPlanToEpisodeStoryPlan } from "@/lib/episode-builder/imagePromptService";

const WW2_PLAN = {
  storyTitle: "The Last Flight",
  logline:
    "A young pilot learns that courage in war is measured in conscience, not conquest.",
  genre: "Historical drama",
  tone: "Reflective",
  styleModeRecommendation: "painterly-historical-comic",
  mainCharacters: [
    {
      name: "Kenji",
      description: "A thoughtful young pilot torn between duty and doubt.",
      role: "Protagonist",
      appearanceNotes:
        "Early 20s, short black hair, weary dark eyes, worn flight jacket.",
    },
    {
      name: "Captain Sato",
      description: "Kenji's stern mentor who hides his own grief.",
      role: "Mentor",
      appearanceNotes: "Middle-aged, gray at temples, crisp uniform, scarred hands.",
    },
  ],
  scenes: [
    {
      sceneNumber: 1,
      title: "Dawn Briefing",
      storyRole: "Opening hook",
      summary:
        "Kenji stands among pilots at a misty airfield as engines rumble, his face calm but uncertain.",
      narration: ["The morning smelled of oil and rain.", "Kenji tried not to count the planes that would not return."],
      continuityNotes: ["Establish Kenji's flight jacket and youthful face."],
      visualMood: "Muted dawn light, quiet tension",
      cameraSuggestion: "Wide establishing shot, low angle toward runway",
      whyThisSceneWorks: "Hooks with atmosphere and foreshadows inner conflict.",
    },
    {
      sceneNumber: 2,
      title: "Letters Home",
      storyRole: "World / setup",
      summary:
        "In a cramped barracks, Kenji reads a letter from his sister while other pilots prepare gear.",
      narration: ["Her handwriting made the war feel far away — for a moment."],
      continuityNotes: ["Same Kenji outfit; introduce barracks palette."],
      visualMood: "Warm lamplight against cold morning",
      cameraSuggestion: "Medium shot over shoulder on letter",
      whyThisSceneWorks: "Humanizes Kenji and anchors emotional stakes.",
    },
    {
      sceneNumber: 3,
      title: "Captain's Warning",
      storyRole: "Character emotion",
      summary:
        "Captain Sato grips Kenji's shoulder before takeoff, their faces close, wind tearing at scarves.",
      narration: ["Fly well. Fly home."],
      dialogue: [{ character: "Captain Sato", text: "Remember what you're fighting to protect." }],
      continuityNotes: ["Kenji and Sato uniforms consistent."],
      visualMood: "Windy, restrained emotion",
      cameraSuggestion: "Close two-shot, shallow depth",
      whyThisSceneWorks: "Builds mentor bond and moral framing.",
    },
    {
      sceneNumber: 4,
      title: "Into Clouds",
      storyRole: "Turning point",
      summary:
        "Kenji's plane climbs through storm-gray clouds, sunlight breaking in a thin gold line.",
      narration: ["Above the world, choices felt smaller — and heavier."],
      continuityNotes: ["Show plane insignia; Kenji visible in cockpit."],
      visualMood: "Cinematic scale, awe and isolation",
      cameraSuggestion: "Dynamic wide aerial perspective",
      whyThisSceneWorks: "Visual turning point from ground to sky.",
    },
    {
      sceneNumber: 5,
      title: "Distant Smoke",
      storyRole: "Escalation",
      summary:
        "From altitude, Kenji sees smoke rising over a coastal town, his reflection trembling in the canopy.",
      narration: ["The horizon was beautiful. That was the cruelest part."],
      continuityNotes: ["Maintain Kenji facial features in reflection."],
      visualMood: "Somber contrast between beauty and destruction",
      cameraSuggestion: "Interior cockpit close-up with reflected landscape",
      whyThisSceneWorks: "Escalates without glorifying violence.",
    },
    {
      sceneNumber: 6,
      title: "Hands on Controls",
      storyRole: "Emotional beat",
      summary:
        "Kenji's gloved hands tighten on the stick, knuckles pale, eyes glistening.",
      narration: ["He had trained for skill. No one had trained him for this feeling."],
      continuityNotes: ["Same gloves and jacket details."],
      visualMood: "Intimate strain",
      cameraSuggestion: "Extreme close-up on hands and lower face",
      whyThisSceneWorks: "Pure emotional read without graphic action.",
    },
    {
      sceneNumber: 7,
      title: "Radio Silence",
      storyRole: "Tension",
      summary:
        "Static fills the cockpit as Kenji listens, shadow crossing his face, ocean far below.",
      narration: ["The radio asked for confirmation. His throat went dry."],
      continuityNotes: ["Cockpit layout consistent with scene 5."],
      visualMood: "Claustrophobic tension",
      cameraSuggestion: "Medium shot through canopy frame",
      whyThisSceneWorks: "Decision moment through silence, not combat.",
    },
    {
      sceneNumber: 8,
      title: "Memory of Sister",
      storyRole: "Reflection",
      summary:
        "Soft memory overlay: Kenji as a boy laughing with his sister under cherry blossoms.",
      narration: ["Some orders are easier to obey when you forget who you were."],
      continuityNotes: ["Young Kenji same face structure; softer palette."],
      visualMood: "Gentle nostalgic warmth",
      cameraSuggestion: "Soft-focus medium wide, blossoms framing",
      whyThisSceneWorks: "Emotional mirror to earlier letter scene.",
    },
    {
      sceneNumber: 9,
      title: "Turning Away",
      storyRole: "Climax / payoff",
      summary:
        "Kenji banks the plane away from the smoke, tears streaking as wind pulls at his scarf.",
      narration: ["He chose the harder kind of bravery."],
      continuityNotes: ["Plane angle changes; Kenji expression resolved but shaken."],
      visualMood: "Bittersweet release",
      cameraSuggestion: "Dramatic three-quarter aerial with plane banking",
      whyThisSceneWorks: "Emotional climax through choice, not spectacle.",
    },
    {
      sceneNumber: 10,
      title: "Empty Runway",
      storyRole: "Ending / closure",
      summary:
        "Kenji walks alone down an empty runway at dusk, plane behind him, sky bruised purple.",
      narration: ["The war would continue.", "He would not pretend it had not changed him."],
      continuityNotes: ["Return to airfield; jacket worn, slower gait."],
      visualMood: "Quiet aftermath, open ending",
      cameraSuggestion: "Wide rear follow shot, long shadows",
      whyThisSceneWorks: "Closure with room for future episodes.",
    },
  ],
};

const ROMANCE_PLAN = {
  storyTitle: "Platform 7",
  logline: "Two former lovers meet again when the rain makes every delay feel like fate.",
  genre: "Romance",
  tone: "Warm",
  styleModeRecommendation: "soft-romantic-webtoon",
  mainCharacters: [
    {
      name: "Mara",
      description: "A book editor carrying quiet regret and hope.",
      role: "Protagonist",
      appearanceNotes: "Curly auburn hair, cream coat, soft freckles.",
    },
    {
      name: "Daniel",
      description: "A musician who never stopped wondering what if.",
      role: "Love interest",
      appearanceNotes: "Tall, dark wavy hair, navy peacoat, guitar case.",
    },
  ],
  scenes: [
    {
      sceneNumber: 1,
      title: "Rain on Glass",
      storyRole: "Opening hook",
      summary: "Rain streaks a train station window as Mara checks her phone, shoulders tense.",
      narration: ["Seven years. One platform. No plan."],
      continuityNotes: ["Establish Mara's cream coat and auburn curls."],
      visualMood: "Soft rain blues and warm station lights",
      cameraSuggestion: "Close-up through wet glass",
      whyThisSceneWorks: "Immediate mood and reunion anticipation.",
    },
    {
      sceneNumber: 2,
      title: "The Announcement",
      storyRole: "World / setup",
      summary: "Departure board flickers; travelers blur past Mara in motion.",
      narration: ["The train was delayed. Time suddenly had nowhere else to go."],
      continuityNotes: ["Same station, wider environment."],
      visualMood: "Busy but dreamy motion blur",
      cameraSuggestion: "Medium wide with Mara centered",
      whyThisSceneWorks: "Sets waiting-game premise.",
    },
    {
      sceneNumber: 3,
      title: "A Familiar Voice",
      storyRole: "Character emotion",
      summary: "Daniel appears behind Mara, guitar case in hand, both frozen in recognition.",
      narration: ["She knew that voice before she turned around."],
      dialogue: [{ character: "Daniel", text: "Mara?" }],
      continuityNotes: ["Daniel navy peacoat; height difference visible."],
      visualMood: "Surprised tenderness",
      cameraSuggestion: "Over-shoulder reveal two-shot",
      whyThisSceneWorks: "Reunion beat with body language focus.",
    },
    {
      sceneNumber: 4,
      title: "Awkward Smiles",
      storyRole: "Turning point",
      summary: "They sit on a bench, coffee cups between them, shy half-smiles.",
      narration: ["Small talk felt enormous."],
      continuityNotes: ["Bench and coat details consistent."],
      visualMood: "Warm intimate awkwardness",
      cameraSuggestion: "Medium two-shot, slight downward angle",
      whyThisSceneWorks: "Turn from shock to connection attempt.",
    },
    {
      sceneNumber: 5,
      title: "Old Photograph",
      storyRole: "Escalation",
      summary: "Daniel shows a worn photo from their youth; Mara's eyes soften.",
      narration: ["Some versions of them never left."],
      continuityNotes: ["Photo shows younger versions same features."],
      visualMood: "Nostalgic glow",
      cameraSuggestion: "Close-up on hands and photo",
      whyThisSceneWorks: "Shared history visual anchor.",
    },
    {
      sceneNumber: 6,
      title: "Laughter Returns",
      storyRole: "Emotional beat",
      summary: "Mara laughs mid-story, rain forgotten, Daniel leaning closer.",
      narration: ["Laughter was the bridge they still remembered how to cross."],
      continuityNotes: ["Expressions more open; same outfits."],
      visualMood: "Light warmth breaking through rain",
      cameraSuggestion: "Close two-shot, eye level",
      whyThisSceneWorks: "Emotional thaw moment.",
    },
    {
      sceneNumber: 7,
      title: "Unsaid Words",
      storyRole: "Tension",
      summary: "Mara looks away toward tracks; Daniel's smile falters slightly.",
      narration: ["There was a reason they had stopped calling."],
      continuityNotes: ["Maintain bench setting; cooler shadow on faces."],
      visualMood: "Bittersweet tension",
      cameraSuggestion: "Split composition, faces apart",
      whyThisSceneWorks: "Adds realistic friction.",
    },
    {
      sceneNumber: 8,
      title: "Shared Headphones",
      storyRole: "Reflection",
      summary: "Daniel offers one earbud; they listen, shoulders almost touching.",
      narration: ["The song was theirs before either of them had words for it."],
      continuityNotes: ["Intimate proximity; soft smiles."],
      visualMood: "Tender quiet",
      cameraSuggestion: "Tight side profile two-shot",
      whyThisSceneWorks: "Intimacy without dialogue overload.",
    },
    {
      sceneNumber: 9,
      title: "Train Arrives",
      storyRole: "Climax / payoff",
      summary: "Train lights flood the platform; they stand, faces close, decision hanging.",
      narration: ["The train would leave. The question was whether they would."],
      dialogue: [{ character: "Mara", text: "Stay for one more coffee?" }],
      continuityNotes: ["Dramatic backlight from train."],
      visualMood: "Hopeful cinematic glow",
      cameraSuggestion: "Low angle medium two-shot with train bokeh",
      whyThisSceneWorks: "Choice moment as emotional peak.",
    },
    {
      sceneNumber: 10,
      title: "Platform 7 Again",
      storyRole: "Ending / closure",
      summary: "They walk away together under one umbrella, station fading behind.",
      narration: ["Some reunions are not endings.", "They are beginnings with history."],
      continuityNotes: ["Umbrella shared; walking away from camera."],
      visualMood: "Warm closure, soft rain",
      cameraSuggestion: "Wide rear shot down platform",
      whyThisSceneWorks: "Satisfying open-hearted ending.",
    },
  ],
};

const FANTASY_PLAN = {
  storyTitle: "Luna and the Tide",
  logline: "A lonely girl discovers friendship glows brightest in the deep.",
  genre: "Fantasy",
  tone: "Whimsical",
  styleModeRecommendation: "bright-adventure-comic",
  mainCharacters: [
    {
      name: "Aiko",
      description: "Curious girl who talks to the sea like an old friend.",
      role: "Protagonist",
      appearanceNotes: "Short bob, yellow rain boots, oversized blue sweater.",
    },
    {
      name: "Luna",
      description: "A magical fish with starlit scales and kind eyes.",
      role: "Magical companion",
      appearanceNotes: "Large koi-like fish with bioluminescent patterns.",
    },
  ],
  scenes: [
    {
      sceneNumber: 1,
      title: "Tide Pool Discovery",
      storyRole: "Opening hook",
      summary: "Aiko kneels by a glowing tide pool at sunset, ripples turning gold.",
      narration: ["The ocean kept secrets. Today it seemed ready to share one."],
      continuityNotes: ["Establish Aiko sweater and yellow boots."],
      visualMood: "Golden whimsical wonder",
      cameraSuggestion: "Low wide shot at tide pool level",
      whyThisSceneWorks: "Instant fantasy hook with childlike scale.",
    },
    {
      sceneNumber: 2,
      title: "First Splash",
      storyRole: "World / setup",
      summary: "Aiko tosses pebbles; one ripple forms a perfect crescent moon shape.",
      narration: ["She laughed before she knew why."],
      continuityNotes: ["Same coastal rocks and outfit."],
      visualMood: "Playful magic emerging",
      cameraSuggestion: "Medium shot on hands and water",
      whyThisSceneWorks: "Introduces magic gently.",
    },
    {
      sceneNumber: 3,
      title: "Luna Appears",
      storyRole: "Character emotion",
      summary: "Luna rises from the pool, starlit scales reflecting in Aiko's wide eyes.",
      narration: ["Hello, small friend."],
      dialogue: [{ character: "Luna", text: "You called the tide. That is rare." }],
      continuityNotes: ["Luna scale pattern fixed; Aiko expression awestruck."],
      visualMood: "Soft luminous awe",
      cameraSuggestion: "Close-up two-subject vertical framing",
      whyThisSceneWorks: "Friendship inciting moment.",
    },
    {
      sceneNumber: 4,
      title: "Secret Language",
      storyRole: "Turning point",
      summary: "Aiko and Luna face each other on rock and water, gestures mirroring.",
      narration: ["Words were not always necessary between wonder and wonder."],
      continuityNotes: ["Consistent Luna glow color."],
      visualMood: "Gentle connection",
      cameraSuggestion: "Symmetrical medium two-shot",
      whyThisSceneWorks: "Bond formation beat.",
    },
    {
      sceneNumber: 5,
      title: "Storm Warning",
      storyRole: "Escalation",
      summary: "Dark clouds gather; Luna circles anxiously, water churning.",
      narration: ["The sea can be kind. It can also be enormous."],
      continuityNotes: ["Sky shifts; characters same designs."],
      visualMood: "Rising stakes, dramatic sky",
      cameraSuggestion: "Wide shot with small figures vs storm",
      whyThisSceneWorks: "Raises adventure stakes.",
    },
    {
      sceneNumber: 6,
      title: "Brave Boots",
      storyRole: "Emotional beat",
      summary: "Aiko stands in surf, boots planted, reaching toward Luna.",
      narration: ["Fear felt smaller when someone needed you."],
      continuityNotes: ["Wet sweater hem; determined expression."],
      visualMood: "Determined warmth",
      cameraSuggestion: "Low hero angle medium shot",
      whyThisSceneWorks: "Character courage moment.",
    },
    {
      sceneNumber: 7,
      title: "Under the Breakers",
      storyRole: "Tension",
      summary: "Underwater view: Aiko held breath, Luna guides her through glowing kelp.",
      narration: ["The world below was louder than the storm above."],
      continuityNotes: ["Underwater lighting on same character designs."],
      visualMood: "Mysterious bioluminescent depth",
      cameraSuggestion: "Vertical underwater wide",
      whyThisSceneWorks: "Fantasy setpiece with clear readability.",
    },
    {
      sceneNumber: 8,
      title: "Memory Shell",
      storyRole: "Reflection",
      summary: "Luna presents a shell pulsing with soft light; Aiko cups it gently.",
      narration: ["Some friendships leave a light you can carry home."],
      continuityNotes: ["Shell glow matches Luna patterns."],
      visualMood: "Quiet magic",
      cameraSuggestion: "Close-up on shell and hands",
      whyThisSceneWorks: "Symbolic emotional object.",
    },
    {
      sceneNumber: 9,
      title: "Storm Breaks",
      storyRole: "Climax / payoff",
      summary: "Sunlight pierces clouds as Luna leaps in an arc of sparkles beside Aiko.",
      narration: ["The tide had listened."],
      continuityNotes: ["Bright restored palette; joyful expressions."],
      visualMood: "Triumphant joy",
      cameraSuggestion: "Dynamic wide with motion arc",
      whyThisSceneWorks: "Visual payoff and celebration.",
    },
    {
      sceneNumber: 10,
      title: "Until Next Tide",
      storyRole: "Ending / closure",
      summary: "Aiko waves from shore at dusk; Luna's glow fades beneath gentle waves.",
      narration: ["Goodbye for now.", "The sea always returns to those who listen."],
      continuityNotes: ["Return to shore; shell in Aiko's pocket."],
      visualMood: "Bittersweet cozy closure",
      cameraSuggestion: "Wide silhouette sunset shot",
      whyThisSceneWorks: "Series-friendly ending with warmth.",
    },
  ],
};

const DEMO_BY_PRESET: Record<string, typeof WW2_PLAN> = {
  "ww2-pilot": WW2_PLAN,
  "romantic-reunion": ROMANCE_PLAN,
  "luna-fish": FANTASY_PLAN,
};

export function getDemoPlanForInput(input: EpisodeBuilderInput): EpisodeStoryPlan {
  const preset = EPISODE_BUILDER_PRESETS.find((p) => {
    const descMatch =
      p.input.description.trim().toLowerCase() ===
      input.description.trim().toLowerCase();
    return descMatch;
  });

  const raw =
    (preset && DEMO_BY_PRESET[preset.id]) ||
    matchByKeywords(input.description) ||
    WW2_PLAN;

  return rawPlanToEpisodeStoryPlan(raw, {
    ...input,
    episodeLength: input.episodeLength || 10,
  });
}

function matchByKeywords(description: string): typeof WW2_PLAN | null {
  const d = description.toLowerCase();
  if (d.includes("pilot") || d.includes("ww2") || d.includes("war")) {
    return WW2_PLAN;
  }
  if (d.includes("romantic") || d.includes("reconnect")) {
    return ROMANCE_PLAN;
  }
  if (d.includes("fish") || d.includes("luna") || d.includes("fantasy")) {
    return FANTASY_PLAN;
  }
  return null;
}
