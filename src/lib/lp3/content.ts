import { BROWSE_CONTENT_CATEGORIES } from "@/lib/browseCategories";

export type LP3StepId =
  | "intro"
  | "categories"
  | "stories"
  | "time"
  | "feel"
  | "habit"
  | "depth"
  | "quiz"
  | "quiz2"
  | "reveal"
  | "stat"
  | "profile"
  | "journey"
  | "loading"
  | "checkout";

export const LP3_LOADING_DURATION_MS = 15_000;

export const LP3_PROGRESS_STEPS: LP3StepId[] = [
  "categories",
  "stories",
  "time",
  "feel",
  "habit",
  "depth",
  "quiz",
  "quiz2",
  "reveal",
  "stat",
  "profile",
  "journey",
  "loading",
  "checkout",
];

export const LP3_STEP_LABELS: Record<LP3StepId, string> = {
  intro: "",
  categories: "Interests",
  stories: "Interests",
  time: "Interests",
  feel: "Personalized",
  habit: "Personalized",
  depth: "Personalized",
  quiz: "Personalized",
  quiz2: "Personalized",
  reveal: "Personalized",
  stat: "Personalized",
  profile: "Your profile",
  journey: "Your plan",
  loading: "Personalized",
  checkout: "Membership",
};

export const LP3_CATEGORY_OPTIONS = BROWSE_CONTENT_CATEGORIES.map((cat) => ({
  id: cat.slug,
  label: cat.label,
  emoji:
    cat.sectionId === "founder-stories"
      ? "🚀"
      : cat.sectionId === "rise-and-fall"
        ? "📉"
        : cat.sectionId === "empires"
          ? "🏛️"
          : cat.sectionId === "heists-and-frauds"
            ? "💸"
            : cat.sectionId === "company-breakdowns"
              ? "📊"
              : "📜",
}));

export const LP3_FEEL_OPTIONS = [
  { id: "fired-up", emoji: "🔥", label: "Fired up" },
  { id: "shocked", emoji: "😱", label: "Shocked" },
  { id: "smarter", emoji: "🧠", label: "Smarter" },
  { id: "hungrier", emoji: "💰", label: "Hungrier" },
  { id: "strategic", emoji: "🎯", label: "More strategic" },
  { id: "clear", emoji: "🌿", label: "Clear-headed" },
] as const;

export const LP3_TIME_OPTIONS = [
  { id: "5", emoji: "⚡", label: "5 minutes — one sharp chapter" },
  { id: "10", emoji: "📖", label: "10 minutes — full episode" },
  { id: "15", emoji: "🎬", label: "15+ minutes — go deep" },
] as const;

export const LP3_HABIT_OPTIONS = [
  { id: "morning", emoji: "☀️", label: "Morning commute" },
  { id: "lunch", emoji: "🥪", label: "Lunch break" },
  { id: "evening", emoji: "🌙", label: "Evening wind-down" },
  { id: "weekend", emoji: "📅", label: "Weekend binge" },
] as const;

export const LP3_DEPTH_OPTIONS = [
  { id: "strategy", emoji: "♟️", label: "Strategy & decisions" },
  { id: "drama", emoji: "🎭", label: "Drama & power plays" },
  { id: "numbers", emoji: "📈", label: "Money & markets" },
  { id: "lessons", emoji: "💡", label: "Lessons I can apply" },
] as const;

export const LP3_QUIZ = {
  question:
    "Apple was 90 days from bankruptcy when Steve Jobs returned. How long until profitability?",
  options: [
    { id: "30", label: "30 days" },
    { id: "365", label: "One year", correct: true },
    { id: "730", label: "Two years" },
    { id: "1095", label: "Three years" },
  ],
  explanation:
    "Jobs cut products, secured a Microsoft investment, and refocused Apple — back in the black within a year.",
};

export const LP3_QUIZ_2 = {
  question:
    "WeWork hit a $47B valuation before its IPO. Roughly what was it worth months later?",
  options: [
    { id: "47", label: "$47 billion" },
    { id: "10", label: "$10 billion" },
    { id: "8", label: "$8 billion", correct: true },
    { id: "1", label: "$1 billion" },
  ],
  explanation:
    "After the S-1 leaked, investors saw the losses. The IPO collapsed and the valuation cratered — a classic rise-and-fall story.",
};

export const LP3_STAT = {
  percent: 98,
  text: "of readers say they understand a business story better after one Toonlora chapter.",
};

export const LP3_PROFILE_ARCHETYPES: Record<
  string,
  { title: string; description: string; traits: string[] }
> = {
  founder_stories: {
    title: "The Builder's Lens",
    description:
      "You're drawn to obsession, ego, and the decisions that turn founders into legends — or cautionary tales.",
    traits: ["Strategy", "Obsession", "Risk", "Vision", "Legacy", "Pressure"],
  },
  rise_and_fall: {
    title: "The Fall Watch",
    description:
      "You want the climb and the crash — hubris, denial, and the moment everything breaks.",
    traits: ["Hubris", "Power", "Denial", "Collapse", "Lessons", "Drama"],
  },
  empires: {
    title: "The Empire Architect",
    description:
      "You care how brands scale, dominate categories, and defend moats for decades.",
    traits: ["Scale", "Brand", "Moats", "Culture", "Dominance", "Ops"],
  },
  heists_and_frauds: {
    title: "The Deal Detective",
    description:
      "You're pulled to fraud, leverage, and the people who bent the rules until the system snapped.",
    traits: ["Fraud", "Leverage", "Secrets", "Power", "Greed", "Justice"],
  },
  default: {
    title: "The Strategy Reader",
    description:
      "You want the real story behind billion-dollar moves — not the press release version.",
    traits: ["Strategy", "Finance", "Leadership", "Risk", "Markets", "Truth"],
  },
};

export const LP3_JOURNEY_WEEKS = [
  { label: "Now", title: "Your watchlist is set" },
  { label: "Week 1–2", title: "Founder sagas & breakdowns" },
  { label: "Week 3–4", title: "Rise, fall & fraud deep dives" },
  { label: "Month 1", title: "Full library unlocked", crown: true },
];

export const LP3_LOADING_TASKS = [
  "Analyzing your answers",
  "Matching categories & mood",
  "Finding stories picked for you",
  "Ranking your watchlist",
  "Calibrating chapter pace",
  "Creating your personalized plan",
];

export const LP3_CHECKOUT_VALUE_PROP = {
  headline:
    "Unlock the business stories behind the world's biggest founders, frauds, empires and collapses.",
  subhead:
    "Real verified stories. Deep research. New episodes every week.",
};

/** Shown inside the selected plan card on checkout (3–5 bullets). */
export const LP3_PLAN_HIGHLIGHTS: Record<"achiever" | "entrepreneur", string[]> =
  {
    achiever: [
      "Unlimited chapters on every story",
      "New episodes every week",
      "Ad-free reading on all devices",
      "Save progress across your library",
    ],
    entrepreneur: [
      "Everything in Achiever",
      "Read new episodes 1 week earlier",
      "Save stories to your library",
      "Share 1 story per month with a friend",
      "Priority for new flagship series",
    ],
  };

export const LP3_MEMBERSHIP_INCLUDES_PREVIEW_COUNT = 5;

export const LP3_MEMBERSHIP_INCLUDES = [
  "300+ in-depth business episodes",
  "New chapters added every week",
  "Researched and written by 16 Harvard students",
  "Real founder stories, fraud cases & company breakdowns",
  "Specific info you won't get from headlines",
  "Illustrated cinematic chapter format",
  "Ad-free reading on every device",
  "Save progress across your library",
  "Founder comebacks & empire builds",
  "Fraud cases from Enron to FTX",
  "Company breakdowns & strategy deep dives",
  "New verified stories added weekly",
  "Billion-dollar collapse narratives",
  "Power moves & boardroom battles",
  "History drops & market shocks",
  "Watchlist tailored to your interests",
  "Read on phone, tablet & desktop",
  "Cancel anytime from your profile",
  "30-day money-back guarantee",
  "Early access with Entrepreneur plan",
];

export const LP3_LIBRARY_UNLOCK = {
  title: "Your membership unlocks the full Toonlora library:",
  body: "300+ cinematic business episodes about founders, frauds, power moves and billion-dollar collapses — with new verified chapters added every week.",
};

export const LP3_BENEFITS = LP3_MEMBERSHIP_INCLUDES;

export const LP3_FAQ = [
  {
    q: "Why do readers binge Toonlora?",
    a: "Every story is built like a series — research-backed, visually cinematic, and designed to be read in minutes.",
  },
  {
    q: "How do I get access?",
    a: "Pick a plan, create your account at checkout, and start reading immediately on any device.",
  },
  {
    q: "How can I cancel?",
    a: "Manage or cancel anytime from your profile. No hidden fees — your membership stays in your control.",
  },
];

export interface LP3Review {
  initials: string;
  name: string;
  avatarColor: string;
  rating: number;
  timeAgo: string;
  title: string;
  body: string;
}

export const LP3_REVIEWS: LP3Review[] = [
  {
    initials: "SM",
    name: "Sophie M.",
    avatarColor: "#F5D0C5",
    rating: 4.9,
    timeAgo: "2 days ago",
    title: "I love this app!",
    body: "I love this app! I thought I knew everything about Steve Jobs. Turns out the fight to get back into Apple was far more brutal than any documentary showed — and the panels make it hit harder.",
  },
  {
    initials: "MB",
    name: "Marcus B.",
    avatarColor: "#F9E4C8",
    rating: 5.0,
    timeAgo: "1 week ago",
    title: "The perfect way to unwind after a chaotic day",
    body: "The founder stories pull you straight into another world. It's sharp, cinematic, and surprisingly moving. Every chapter leaves me wanting just one more — without a three-hour podcast.",
  },
  {
    initials: "ER",
    name: "Elena R.",
    avatarColor: "#D4E8D4",
    rating: 4.8,
    timeAgo: "3 days ago",
    title: "I downloaded this expecting a quick read",
    body: "I downloaded this expecting a quick escape, but I got hooked on the FTX saga almost immediately. It feels like Succession, but with real balance sheets and much higher stakes.",
  },
];

export const LP3_STORY_REVEALS: Record<
  string,
  { headline: string; record: string; real: string; tags: string[] }
> = {
  "steve-jobs": {
    headline: "What Apple hid about Jobs' return",
    record: "Steve Jobs — co-founder. Ousted in 1985. Returned as interim CEO in 1997.",
    real: "The board offered him the job in a parking lot conversation. His first move wasn't a product — it was killing almost every project Apple had.",
    tags: ["COMEBACK", "APPLE", "FOCUS"],
  },
  "elon-musk": {
    headline: "What Tesla hid about Christmas Eve 2008",
    record: "Elon Musk — CEO of Tesla and SpaceX. Nearly out of cash in late 2008.",
    real: "Both companies were days from death. He bet his last personal dollars on one more Falcon 1 launch — and a Daimler deal that saved Tesla.",
    tags: ["NEAR-DEATH", "TESLA", "SPACEX"],
  },
  "ferrari": {
    headline: "What Enzo hid about the Ford deal",
    record: "Enzo Ferrari — founder. Nearly sold Ferrari to Ford in 1963.",
    real: "He walked away over a clause about racing control. Ford's rage funded the GT40 program — and Ferrari's myth grew sharper.",
    tags: ["EGO", "RACING", "LEGACY"],
  },
  default: {
    headline: "What the boardroom minutes never said",
    record: "The official story — polished for investors and the press.",
    real: "The real decisions happened in late-night calls, leaked decks, and bets nobody wanted on the record.",
    tags: ["STRATEGY", "POWER", "TRUTH"],
  },
};
