import type { LpStoryTeaser } from "@/lib/lp/storyTeasers";
import {
  LP_STORY_TEASERS,
  resolveStoryIdFromCoverTitle,
} from "@/lib/lp/storyTeasers";
import { normalizeCoverTitleSlug } from "@/lib/lp3/coverTitleParam";
import {
  buildFallbackStoryFunnelCopyNl,
  LP6_STORY_FUNNEL_COPY_NL,
} from "@/lib/lp6/storyFunnelCopy.nl";

export interface Lp6QuizOption {
  id: string;
  label: string;
  correct?: boolean;
}

export interface Lp6ChoiceOption {
  id: string;
  emoji: string;
  label: string;
}

export interface Lp6StoryFunnelCopy {
  storyWhy: { title: string; options: Lp6ChoiceOption[] };
  stories: { title: string };
  depth: { title: string; options: Lp6ChoiceOption[] };
  quiz: { question: string; options: Lp6QuizOption[]; explanation: string };
  quiz2: { question: string; options: Lp6QuizOption[]; explanation: string };
  reveal: { headline: string; record: string; real: string; tags: string[] };
  profile: { title: string; description: string; traits: string[] };
  journey: {
    title: string;
    subtitle: string;
    weeks: { label: string; title: string; crown?: boolean }[];
  };
  loading: { headline: string; tasks: string[] };
}

const STORY_WHY_EMOJIS = ["📉", "🚀", "💰", "💥", "💡", "🎭"] as const;

function storyWhyOptions(storyName: string, labels: string[]): Lp6ChoiceOption[] {
  return labels.map((label, i) => ({
    id: `why-${i}`,
    emoji: STORY_WHY_EMOJIS[i % STORY_WHY_EMOJIS.length]!,
    label,
  }));
}

function depthOptions(labels: string[]): Lp6ChoiceOption[] {
  const emojis = ["♟️", "🎭", "📈", "💡"];
  return labels.map((label, i) => ({
    id: `depth-${i}`,
    emoji: emojis[i % emojis.length]!,
    label,
  }));
}

const LP6_STORY_FUNNEL_COPY_EN: Record<string, Lp6StoryFunnelCopy> = {
  "ray-kroc": {
    storyWhy: {
      title: "What pulls you into the McDonald's / Ray Kroc story?",
      options: storyWhyOptions("McDonald's", [
        "How a milkshake salesman scaled a burger stand",
        "The deal with the McDonald brothers",
        "Franchise contracts and royalty fights",
        "Speed, systems, and the assembly line kitchen",
        "How Kroc outplayed the founders",
        "The empire after the handshake broke",
      ]),
    },
    stories: {
      title: "Besides McDonald's, which business sagas might hook you next?",
    },
    depth: {
      title: "Which part of the McDonald's story do you want first?",
      options: depthOptions([
        "The San Bernardino visit that changed everything",
        "The franchise contract the brothers regretted",
        "Real estate — how Kroc really made his fortune",
        "The legal war that erased the brothers' name",
      ]),
    },
    quiz: {
      question:
        "Ray Kroc was 52 and selling milkshake machines when he first saw the McDonald brothers' restaurant. What year was that?",
      options: [
        { id: "1945", label: "1945" },
        { id: "1954", label: "1954", correct: true },
        { id: "1961", label: "1961" },
        { id: "1973", label: "1973" },
      ],
      explanation:
        "In 1954 Kroc walked into a tiny California burger stand — and saw a system he could franchise across America.",
    },
    quiz2: {
      question:
        "Kroc eventually bought out the McDonald brothers. Roughly how much did he pay for their name and company?",
      options: [
        { id: "2.7m", label: "$2.7 million", correct: true },
        { id: "27m", label: "$27 million" },
        { id: "100m", label: "$100 million" },
        { id: "1b", label: "$1 billion" },
      ],
      explanation:
        "Kroc paid $2.7M in 1961 — then built a global empire while the brothers were erased from the brand's origin myth.",
    },
    reveal: {
      headline: "What McDonald's never put on the golden arches",
      record:
        "Ray Kroc — milkshake machine salesman. Met the McDonald brothers in 1954. Built the global franchise.",
      real:
        "The brothers wanted a small chain. Kroc wanted every corner in America. His first move wasn't burgers — it was owning the land under every franchise.",
      tags: ["FRANCHISE", "REAL ESTATE", "BETRAYAL"],
    },
    profile: {
      title: "The Franchise Strategist",
      description:
        "You're drawn to operators who see systems where others see a single store — and who play the long game on contracts and land.",
      traits: ["Scale", "Systems", "Deals", "Leverage", "Speed", "Control"],
    },
    journey: {
      title: "Your McDonald's deep-dive starts now",
      subtitle: "Chapter 1 unlocks the visit that changed fast food forever.",
      weeks: [
        { label: "Now", title: "Ray Kroc meets the brothers" },
        { label: "Week 1", title: "The franchise machine spins up" },
        { label: "Week 2", title: "Contracts, royalties & the buyout" },
        { label: "Month 1", title: "Full library + new sagas weekly", crown: true },
      ],
    },
    loading: {
      headline: "Building your McDonald's reading plan…",
      tasks: [
        "Matching your interest in Ray Kroc",
        "Pulling franchise & founder chapters",
        "Ranking similar empire-build sagas",
        "Setting your first 5-minute chapter",
        "Calibrating pace for business deep dives",
        "Finalizing your personalized watchlist",
      ],
    },
  },
  wework: {
    storyWhy: {
      title: "What fascinates you most about the WeWork collapse?",
      options: storyWhyOptions("WeWork", [
        "Adam Neumann's vision and charisma",
        "The $47B private valuation hype",
        "How SoftBank kept funding the losses",
        "The IPO S-1 that killed the dream",
        "Shared office space as a 'community' brand",
        "Hubris, parties, and the crash",
      ]),
    },
    stories: { title: "Besides WeWork, which rise-and-fall stories interest you?" },
    depth: {
      title: "Which angle of WeWork do you want to understand first?",
      options: depthOptions([
        "Neumann's pitch and personality cult",
        "The numbers SoftBank ignored",
        "WeLive, WeGrow, and mission creep",
        "The week the IPO died in public",
      ]),
    },
    quiz: {
      question:
        "WeWork's peak private valuation before its failed IPO was roughly:",
      options: [
        { id: "47", label: "$47 billion", correct: true },
        { id: "10", label: "$10 billion" },
        { id: "100", label: "$100 billion" },
        { id: "1", label: "$1 billion" },
      ],
      explanation:
        "WeWork hit ~$47B on paper — until investors read the S-1 and saw how much cash it was burning.",
    },
    quiz2: {
      question:
        "After the IPO collapsed, WeWork's valuation fell to roughly:",
      options: [
        { id: "47", label: "$47 billion" },
        { id: "10", label: "$10 billion" },
        { id: "8", label: "$8 billion", correct: true },
        { id: "1", label: "$1 billion" },
      ],
      explanation:
        "Within months the fantasy unraveled — a textbook rise-and-fall fueled by narrative over unit economics.",
    },
    reveal: {
      headline: "What WeWork's pitch deck never disclosed",
      record:
        "WeWork — shared offices rebranded as community. Raised billions. Planned a landmark IPO in 2019.",
      real:
        "The S-1 revealed staggering losses and self-dealing. Neumann's exit package made headlines — the business model made investors flee.",
      tags: ["HYPE", "IPO", "COLLAPSE"],
    },
    profile: {
      title: "The Fall Watcher",
      description:
        "You want the climb and the crash — when charisma, valuation, and denial outrun the spreadsheet.",
      traits: ["Hubris", "Valuation", "Narrative", "Losses", "IPO", "Drama"],
    },
    journey: {
      title: "Your WeWork saga starts here",
      subtitle: "From coworking side hustle to billion-dollar fantasy — and back.",
      weeks: [
        { label: "Now", title: "Neumann's pitch lands" },
        { label: "Week 1", title: "SoftBank's billions arrive" },
        { label: "Week 2", title: "The S-1 leak & IPO collapse" },
        { label: "Month 1", title: "Full library unlocked", crown: true },
      ],
    },
    loading: {
      headline: "Mapping your WeWork reading path…",
      tasks: [
        "Analyzing your WeWork interests",
        "Pulling rise-and-fall chapters",
        "Finding similar hype-cycle sagas",
        "Ranking fraud & collapse stories",
        "Setting chapter pace",
        "Building your watchlist",
      ],
    },
  },
  "steve-jobs": {
    storyWhy: {
      title: "Why does the Steve Jobs / Apple story hit different for you?",
      options: storyWhyOptions("Apple", [
        "Jobs getting fired from his own company",
        "The comeback as interim CEO",
        "Product obsession and 'one more thing'",
        "The Microsoft deal that saved Apple",
        "Pixar and the wilderness years",
        "How he reshaped phones, music, and retail",
      ]),
    },
    stories: { title: "Besides Apple, which founder comebacks intrigue you?" },
    depth: {
      title: "Which chapter of Jobs' arc do you want first?",
      options: depthOptions([
        "Garage startup & the first Apple IPO",
        "The boardroom coup that ousted him",
        "NeXT, Pixar, and the return",
        "The product blitz: iMac to iPhone",
      ]),
    },
    quiz: {
      question:
        "Apple was roughly 90 days from bankruptcy when Steve Jobs returned in 1997. How long until profitability?",
      options: [
        { id: "30", label: "30 days" },
        { id: "365", label: "One year", correct: true },
        { id: "730", label: "Two years" },
        { id: "1095", label: "Three years" },
      ],
      explanation:
        "Jobs killed product lines, cut deals, and refocused Apple — back in the black within a year.",
    },
    quiz2: {
      question:
        "Which rival's investment helped keep Apple alive during Jobs' first year back?",
      options: [
        { id: "google", label: "Google" },
        { id: "microsoft", label: "Microsoft", correct: true },
        { id: "ibm", label: "IBM" },
        { id: "dell", label: "Dell" },
      ],
      explanation:
        "A $150M Microsoft investment — announced on stage — bought Apple runway to rebuild.",
    },
    reveal: {
      headline: "What Apple hid about Jobs' return",
      record:
        "Steve Jobs — co-founder. Ousted in 1985. Returned as interim CEO in 1997.",
      real:
        "The board offered him the job in a parking lot conversation. His first move wasn't a product — it was killing almost every project Apple had.",
      tags: ["COMEBACK", "APPLE", "FOCUS"],
    },
    profile: {
      title: "The Product Purist",
      description:
        "You care about taste, focus, and founders who bet the company on a single vision — even after being exiled.",
      traits: ["Design", "Focus", "Comeback", "Ego", "Vision", "Craft"],
    },
    journey: {
      title: "Your Apple / Jobs journey begins",
      subtitle: "From garage to exile to the greatest product comeback in tech.",
      weeks: [
        { label: "Now", title: "Jobs walks back into Apple" },
        { label: "Week 1", title: "The cuts & the Microsoft deal" },
        { label: "Week 2", title: "iMac, iPod, iPhone era" },
        { label: "Month 1", title: "Full founder library", crown: true },
      ],
    },
    loading: {
      headline: "Crafting your Apple reading plan…",
      tasks: [
        "Matching your Jobs / Apple interests",
        "Pulling founder comeback chapters",
        "Finding similar product-obsessed sagas",
        "Ranking tech empire stories",
        "Setting 5-minute chapter pace",
        "Finalizing your watchlist",
      ],
    },
  },
  theranos: {
    storyWhy: {
      title: "What draws you into the Theranos / Elizabeth Holmes story?",
      options: storyWhyOptions("Theranos", [
        "The one-drop-of-blood pitch",
        "Silicon Valley hype and board glamour",
        "How regulators were kept in the dark",
        "Walgreens and partner due diligence",
        "Holmes' voice, image, and narrative control",
        "The whistleblowers who broke the spell",
      ]),
    },
    stories: { title: "Besides Theranos, which fraud sagas interest you?" },
    depth: {
      title: "Which part of Theranos do you want to read first?",
      options: depthOptions([
        "The founding myth at Stanford",
        "Fake demos and lab reality",
        "Celebrity board members & press",
        "The Wall Street Journal exposé",
      ]),
    },
    quiz: {
      question:
        "Theranos claimed its Edison device could run hundreds of tests from how much blood?",
      options: [
        { id: "drop", label: "A single drop", correct: true },
        { id: "vial", label: "A standard vial" },
        { id: "pinch", label: "A finger-prick only — no blood" },
        { id: "ml", label: "10 ml" },
      ],
      explanation:
        "The entire pitch hinged on one drop — a promise the technology never delivered at scale.",
    },
    quiz2: {
      question:
        "Theranos peaked around what private valuation before the collapse?",
      options: [
        { id: "1b", label: "$1 billion" },
        { id: "4.5b", label: "$4.5 billion", correct: true },
        { id: "10b", label: "$10 billion" },
        { id: "47b", label: "$47 billion" },
      ],
      explanation:
        "At ~$4.5B on paper, Theranos was a cautionary tale of story over science.",
    },
    reveal: {
      headline: "What Theranos never showed Walgreens",
      record:
        "Theranos — blood testing startup. Founded by Elizabeth Holmes. Valued at billions.",
      real:
        "Lab results were often run on commercial machines while Edison demos used staged protocols — partners and patients were misled for years.",
      tags: ["FRAUD", "HYPE", "BIOTECH"],
    },
    profile: {
      title: "The Due-Diligence Reader",
      description:
        "You want the gap between the pitch deck and the lab — where charisma outruns verification.",
      traits: ["Fraud", "Hype", "Science", "Boards", "Whistleblowers", "Ethics"],
    },
    journey: {
      title: "Your Theranos deep-dive starts now",
      subtitle: "From Stanford dropout to billion-dollar lie — chapter by chapter.",
      weeks: [
        { label: "Now", title: "The one-drop pitch lands" },
        { label: "Week 1", title: "Partners, press & board glamour" },
        { label: "Week 2", title: "Whistleblowers & collapse" },
        { label: "Month 1", title: "Full fraud-story library", crown: true },
      ],
    },
    loading: {
      headline: "Building your Theranos reading plan…",
      tasks: [
        "Matching fraud-story interests",
        "Pulling Theranos chapters",
        "Finding Enron, FTX & similar sagas",
        "Ranking heist & fraud episodes",
        "Setting chapter pace",
        "Finalizing watchlist",
      ],
    },
  },
  nokia: {
    storyWhy: {
      title: "Why does the Nokia fall still matter to you?",
      options: storyWhyOptions("Nokia", [
        "Missing the smartphone shift",
        "The iPhone moment in 2007",
        "Betting on Windows Phone",
        "How market share vanished so fast",
        "Hardware excellence vs software ecosystem",
        "A cautionary tale for incumbents",
      ]),
    },
    stories: { title: "Besides Nokia, which business-mistake stories hook you?" },
    depth: {
      title: "Which Nokia chapter do you want first?",
      options: depthOptions([
        "Peak dominance — half the world's phones",
        "The iPhone wake-up call",
        "Internal culture & bureaucracy",
        "The Microsoft alliance and write-down",
      ]),
    },
    quiz: {
      question:
        "At its peak around 2007, Nokia commanded roughly what share of global phone sales?",
      options: [
        { id: "20", label: "~20%" },
        { id: "40", label: "~40%" },
        { id: "50", label: "~50%", correct: true },
        { id: "70", label: "~70%" },
      ],
      explanation:
        "Nokia was the king of mobile — until smartphones rewrote the category overnight.",
    },
    quiz2: {
      question:
        "Nokia eventually sold its phone business to which company?",
      options: [
        { id: "apple", label: "Apple" },
        { id: "google", label: "Google" },
        { id: "microsoft", label: "Microsoft", correct: true },
        { id: "samsung", label: "Samsung" },
      ],
      explanation:
        "The Microsoft deal closed a chapter — but couldn't rewind the smartphone miss.",
    },
    reveal: {
      headline: "What Nokia's board minutes never said out loud",
      record:
        "Nokia — world's largest phone maker. Dominant through the 2000s. Disrupted by smartphones.",
      real:
        "Teams saw the iPhone threat early — but bureaucracy, fear of cannibalizing Symbian, and slow decisions cost them the future.",
      tags: ["DISRUPTION", "IPHONE", "MISS"],
    },
    profile: {
      title: "The Incumbent Skeptic",
      description:
        "You study how leaders at the top miss the turn — when success makes the next bet feel impossible.",
      traits: ["Disruption", "Culture", "Speed", "Ecosystem", "Hubris", "Lessons"],
    },
    journey: {
      title: "Your Nokia cautionary tale begins",
      subtitle: "From global king to case study in missing the future.",
      weeks: [
        { label: "Now", title: "Peak Nokia — unstoppable?" },
        { label: "Week 1", title: "iPhone shock & internal debate" },
        { label: "Week 2", title: "Windows bet & decline" },
        { label: "Month 1", title: "Full mistake-story library", crown: true },
      ],
    },
    loading: {
      headline: "Mapping your Nokia reading path…",
      tasks: [
        "Analyzing disruption interests",
        "Pulling Nokia chapters",
        "Finding Blockbuster-style misses",
        "Ranking strategy mistake sagas",
        "Setting chapter pace",
        "Building watchlist",
      ],
    },
  },
};

function canonicalFunnelStoryId(storyId: string, storyName: string): string {
  return (
    resolveStoryIdFromCoverTitle(storyId) ??
    resolveStoryIdFromCoverTitle(storyName) ??
    normalizeCoverTitleSlug(storyId)
  );
}

function buildFallbackStoryFunnelCopyEn(
  storyName: string,
  teaser: LpStoryTeaser
): Lp6StoryFunnelCopy {
  const category = teaser.category.toLowerCase();
  const isFraud = category.includes("fraud") || category.includes("heist");
  const isFall = category.includes("fall") || category.includes("collapse");
  const isFounder = category.includes("founder");

  const whyLabels = isFraud
    ? [
        `How ${storyName} sold the vision`,
        "The money and the lies",
        "Who believed — and who blew the whistle",
        "Regulators, partners, and blind spots",
        "The moment the story cracked",
        "What it teaches about due diligence",
      ]
    : isFall
      ? [
          `How ${storyName} rose so fast`,
          "The hype and the headlines",
          "Hubris inside the boardroom",
          "The numbers nobody wanted to see",
          `How ${storyName} collapsed`,
          "Lessons for the next cycle",
        ]
      : isFounder
        ? [
            `The founder bet behind ${storyName}`,
            "Early decisions that scaled — or broke",
            "Ego, vision, and pressure",
            "The deal that changed everything",
            "Rivals, partners, and betrayals",
            "The legacy left behind",
          ]
        : [
            `The strategy moves behind ${storyName}`,
            "Money, power, and market shifts",
            "The drama behind the headlines",
            "What investors never saw",
            "How the empire was built — or broke",
            "Lessons you can actually use",
          ];

  const depthLabels = [
    `The origin — before ${storyName} was famous`,
    "The pivotal decision everyone argues about",
    "The rivals and the power plays",
    "The aftermath — what happened next",
  ];

  return {
    storyWhy: {
      title: `Why do you want to read the ${storyName} story?`,
      options: storyWhyOptions(storyName, whyLabels),
    },
    stories: {
      title: `Besides ${storyName}, what other business sagas might hook you?`,
    },
    depth: {
      title: `What part of the ${storyName} story do you want first?`,
      options: depthOptions(depthLabels),
    },
    quiz: {
      question: `True or false: "${teaser.hook}"`,
      options: [
        { id: "true", label: "That's the core tension — I want the full story", correct: true },
        { id: "myth", label: "Sounds exaggerated — show me the receipts" },
        { id: "new", label: "I barely know this story" },
        { id: "expert", label: "I know the headlines — I want what wasn't reported" },
      ],
      explanation: teaser.description,
    },
    quiz2: {
      question: `How deep do you want to go on ${storyName}?`,
      options: [
        { id: "5", label: "One 5-minute chapter to start" },
        { id: "arc", label: "The full arc — rise, turn, and aftermath", correct: true },
        { id: "compare", label: "Compare it to similar sagas in the library" },
        { id: "lessons", label: "Just the strategic lessons" },
      ],
      explanation: `Every ${storyName} chapter is researched, illustrated, and built to read in minutes — not hours.`,
    },
    reveal: {
      headline: `What the ${storyName} headlines never explained`,
      record: `The official version of ${storyName} — polished for press and investors.`,
      real: teaser.description.replace(/^Read /i, ""),
      tags: [teaser.category.split(" ")[0]!.toUpperCase(), "DEEP DIVE", "VERIFIED"],
    },
    profile: {
      title: isFraud
        ? "The Fraud Tracker"
        : isFall
          ? "The Rise & Fall Reader"
          : isFounder
            ? "The Founder Arc Reader"
            : "The Strategy Reader",
      description: `You're here for ${storyName} — and stories like it where the real decisions happened far from the press release.`,
      traits: isFraud
        ? ["Fraud", "Hype", "Due diligence", "Power", "Secrets", "Justice"]
        : isFall
          ? ["Hubris", "Valuation", "Collapse", "Drama", "Lessons", "Power"]
          : isFounder
            ? ["Vision", "Risk", "Ego", "Scale", "Legacy", "Pressure"]
            : ["Strategy", "Markets", "Leadership", "Truth", "Finance", "Risk"],
    },
    journey: {
      title: `Your ${storyName} reading plan is ready`,
      subtitle: teaser.hook,
      weeks: [
        { label: "Now", title: `Start ${storyName} — chapter 1` },
        { label: "Week 1", title: "Similar sagas in your watchlist" },
        { label: "Week 2", title: "Deeper episodes on the same theme" },
        { label: "Month 1", title: "3000+ stories unlocked", crown: true },
      ],
    },
    loading: {
      headline: `Personalizing your ${storyName} experience…`,
      tasks: [
        `Analyzing your interest in ${storyName}`,
        "Matching related business sagas",
        "Ranking chapters for your watchlist",
        "Calibrating 5-minute reading pace",
        "Pulling verified deep-dive episodes",
        "Finalizing your plan",
      ],
    },
  };
}

export function resolveStoryFunnelCopy(
  storyId: string,
  storyName: string,
  teaser?: LpStoryTeaser,
  locale = "en"
): Lp6StoryFunnelCopy {
  const canonicalId = canonicalFunnelStoryId(storyId, storyName);
  const isNl = locale === "nl";
  const explicit = isNl
    ? LP6_STORY_FUNNEL_COPY_NL[canonicalId]
    : LP6_STORY_FUNNEL_COPY_EN[canonicalId];
  if (explicit) return explicit;

  const teaserResolved =
    teaser ?? LP_STORY_TEASERS[canonicalId] ?? {
      category: isNl ? "Businessverhaal" : "Business Story",
      hook: isNl
        ? `Het verhaal achter ${storyName}`
        : `The story behind ${storyName}`,
      description: isNl
        ? `Lees de cinematische deep-dive over ${storyName}.`
        : `Read the cinematic deep-dive into ${storyName}.`,
    };

  return isNl
    ? buildFallbackStoryFunnelCopyNl(storyName, teaserResolved)
    : buildFallbackStoryFunnelCopyEn(storyName, teaserResolved);
}
