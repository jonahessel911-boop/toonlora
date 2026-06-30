import type { Lp6ChoiceOption, Lp6StoryFunnelCopy } from "./storyFunnelCopy";

const STORY_WHY_EMOJIS = ["📉", "🚀", "💰", "💥", "💡", "🎭"] as const;

function storyWhyOptions(labels: string[]): Lp6ChoiceOption[] {
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

/** Dutch per-story funnel copy for LP/6. */
export const LP6_STORY_FUNNEL_COPY_NL: Record<string, Lp6StoryFunnelCopy> = {
  "ray-kroc": {
    storyWhy: {
      title: "Wat trekt je in het McDonald's / Ray Kroc-verhaal?",
      options: storyWhyOptions([
        "Hoe een milkshake-verkoper een burgerkraam opschaalde",
        "De deal met de McDonald-broers",
        "Franchisecontracten en royalty-strijd",
        "Snelheid, systemen en de assembly line-keuken",
        "Hoe Kroc de oprichters versloeg",
        "Het imperium nadat de handdruk brak",
      ]),
    },
    stories: {
      title: "Naast McDonald's — welke businessverhalen spreken je nog meer aan?",
    },
    depth: {
      title: "Welk deel van het McDonald's-verhaal wil je eerst lezen?",
      options: depthOptions([
        "Het San Bernardino-bezoek dat alles veranderde",
        "Het franchisecontract waar de broers spijt van kregen",
        "Vastgoed — hoe Kroc echt zijn fortuin maakte",
        "De juridische strijd die de naam van de broers uitwiste",
      ]),
    },
    quiz: {
      question:
        "Ray Kroc was 52 en verkocht milkshakemachines toen hij het restaurant van de McDonald-broers zag. In welk jaar was dat?",
      options: [
        { id: "1945", label: "1945" },
        { id: "1954", label: "1954", correct: true },
        { id: "1961", label: "1961" },
        { id: "1973", label: "1973" },
      ],
      explanation:
        "In 1954 liep Kroc een kleine Californische burgerstand binnen — en zag een systeem dat hij over Amerika kon franchisen.",
    },
    quiz2: {
      question:
        "Kroc kocht de McDonald-broers uiteindelijk uit. Hoeveel betaalde hij ongeveer voor hun naam en bedrijf?",
      options: [
        { id: "2.7m", label: "$2,7 miljoen", correct: true },
        { id: "27m", label: "$27 miljoen" },
        { id: "100m", label: "$100 miljoen" },
        { id: "1b", label: "$1 miljard" },
      ],
      explanation:
        "Kroc betaalde in 1961 $2,7 miljoen — en bouwde daarna een wereldimperium terwijl de broers uit de oorsprongsmythe verdwenen.",
    },
    reveal: {
      headline: "Wat McDonald's nooit op de golden arches zette",
      record:
        "Ray Kroc — milkshake-verkoper. Ontmoette de McDonald-broers in 1954. Bouwde de wereldwijde franchise.",
      real:
        "De broers wilden een kleine keten. Kroc wilde elke hoek in Amerika. Zijn eerste zet was geen burger — het was het bezit van de grond onder elke franchise.",
      tags: ["FRANCHISE", "VASTGOED", "VERRAAD"],
    },
    profile: {
      title: "De franchise-strateeg",
      description:
        "Je bent gefascineerd door operators die systemen zien waar anderen één zaak zien — en het lange spel spelen op contracten en grond.",
      traits: ["Schaal", "Systemen", "Deals", "Hefboom", "Snelheid", "Controle"],
    },
    journey: {
      title: "Je McDonald's-deep-dive begint nu",
      subtitle: "Hoofdstuk 1 opent het bezoek dat fastfood voor altijd veranderde.",
      weeks: [
        { label: "Nu", title: "Ray Kroc ontmoet de broers" },
        { label: "Week 1", title: "De franchise-machine draait op" },
        { label: "Week 2", title: "Contracten, royalties & de buy-out" },
        { label: "Maand 1", title: "Volledige bibliotheek + wekelijks nieuw", crown: true },
      ],
    },
    loading: {
      headline: "Je McDonald's-leesplan wordt samengesteld…",
      tasks: [
        "Je interesse in Ray Kroc matchen",
        "Franchise- & oprichterhoofdstukken ophalen",
        "Vergelijkbare imperiumverhalen rangschikken",
        "Je eerste 5-minuten-hoofdstuk instellen",
        "Tempo voor business-deep-dives kalibreren",
        "Je persoonlijke watchlist afronden",
      ],
    },
  },
  wework: {
    storyWhy: {
      title: "Wat fascineert je het meest aan de WeWork-ineenstorting?",
      options: storyWhyOptions([
        "Adam Neumanns visie en charisma",
        "De $47 miljard private waardering",
        "Hoe SoftBank de verliezen bleef financieren",
        "De IPO S-1 die de droom doodde",
        "Gedeelde kantoren als 'community'-merk",
        "Hoogmoed, feesten en de crash",
      ]),
    },
    stories: {
      title: "Naast WeWork — welke opkomst-en-ondergang-verhalen spreken je aan?",
    },
    depth: {
      title: "Welke kant van WeWork wil je eerst begrijpen?",
      options: depthOptions([
        "Neumanns pitch en persoonlijkheidscultus",
        "De cijfers die SoftBank negeerde",
        "WeLive, WeGrow en mission creep",
        "De week dat de IPO publiekelijk stierf",
      ]),
    },
    quiz: {
      question:
        "WeWorks piek-waardering vóór de mislukte IPO was ongeveer:",
      options: [
        { id: "47", label: "$47 miljard", correct: true },
        { id: "10", label: "$10 miljard" },
        { id: "100", label: "$100 miljard" },
        { id: "1", label: "$1 miljard" },
      ],
      explanation:
        "WeWork stond op papier op ~$47 miljard — tot investeerders de S-1 lazen en zagen hoeveel cash er verbrand werd.",
    },
    quiz2: {
      question:
        "Nadat de IPO instortte, daalde WeWorks waardering tot ongeveer:",
      options: [
        { id: "47", label: "$47 miljard" },
        { id: "10", label: "$10 miljard" },
        { id: "8", label: "$8 miljard", correct: true },
        { id: "1", label: "$1 miljard" },
      ],
      explanation:
        "Binnen maanden viel de fantasie uiteen — een schoolvoorbeeld van opkomst en ondergang, gedreven door verhaal boven unit economics.",
    },
    reveal: {
      headline: "Wat WeWorks pitchdeck nooit onthulde",
      record:
        "WeWork — gedeelde kantoren hermerkt als community. Milliarden opgehaald. Landmark-IPO gepland in 2019.",
      real:
        "De S-1 onthulde enorme verliezen en self-dealing. Neumanns exitpakket maakte headlines — het businessmodel joeg investeerders op de vlucht.",
      tags: ["HYPE", "IPO", "INEENSTORTING"],
    },
    profile: {
      title: "De val-waarnemer",
      description:
        "Je wilt de klim én de crash — wanneer charisma, waardering en ontkenning de spreadsheet voorbij rennen.",
      traits: ["Hoogmoed", "Waardering", "Verhaal", "Verliezen", "IPO", "Drama"],
    },
    journey: {
      title: "Je WeWork-saga begint hier",
      subtitle: "Van coworking-side-hustle tot miljardenfantasie — en terug.",
      weeks: [
        { label: "Nu", title: "Neumanns pitch landt" },
        { label: "Week 1", title: "SoftBanks miljarden arriveren" },
        { label: "Week 2", title: "De S-1-lek & IPO-ineenstorting" },
        { label: "Maand 1", title: "Volledige bibliotheek ontgrendeld", crown: true },
      ],
    },
    loading: {
      headline: "Je WeWork-leespad wordt in kaart gebracht…",
      tasks: [
        "Je WeWork-interesses analyseren",
        "Opkomst-en-ondergang-hoofdstukken ophalen",
        "Vergelijkbare hype-cycle-saga's zoeken",
        "Fraude- & ineenstortingsverhalen rangschikken",
        "Hoofdstuktempo instellen",
        "Je watchlist samenstellen",
      ],
    },
  },
  "steve-jobs": {
    storyWhy: {
      title: "Waarom raakt het Steve Jobs / Apple-verhaal jou?",
      options: storyWhyOptions([
        "Jobs ontslagen bij zijn eigen bedrijf",
        "De comeback als interim-CEO",
        "Productobsessie en 'one more thing'",
        "De Microsoft-deal die Apple redde",
        "Pixar en de wildernisjaren",
        "Hoe hij telefoons, muziek en retail herschreef",
      ]),
    },
    stories: {
      title: "Naast Apple — welke oprichter-comebacks intrigeren je?",
    },
    depth: {
      title: "Welk hoofdstuk van Jobs' boog wil je eerst?",
      options: depthOptions([
        "Garage-startup & de eerste Apple-IPO",
        "De boardroom-coup die hem eruit werkte",
        "NeXT, Pixar en de terugkeer",
        "De productblitz: iMac tot iPhone",
      ]),
    },
    quiz: {
      question:
        "Apple was ~90 dagen van faillissement verwijderd toen Steve Jobs in 1997 terugkwam. Hoe lang tot winstgevendheid?",
      options: [
        { id: "30", label: "30 dagen" },
        { id: "365", label: "Eén jaar", correct: true },
        { id: "730", label: "Twee jaar" },
        { id: "1095", label: "Drie jaar" },
      ],
      explanation:
        "Jobs schrapte productlijnen, sloot deals en herfocuste Apple — binnen een jaar weer in de plus.",
    },
    quiz2: {
      question:
        "Welke investering van een rivaal hielp Apple overeind in Jobs' eerste jaar terug?",
      options: [
        { id: "google", label: "Google" },
        { id: "microsoft", label: "Microsoft", correct: true },
        { id: "ibm", label: "IBM" },
        { id: "dell", label: "Dell" },
      ],
      explanation:
        "Een investering van $150 miljoen van Microsoft — aangekondigd op het podium — gaf Apple ademruimte om te herbouwen.",
    },
    reveal: {
      headline: "Wat Apple verborg over Jobs' terugkeer",
      record:
        "Steve Jobs — medeoprichter. Verdreven in 1985. Terug als interim-CEO in 1997.",
      real:
        "De raad bood hem de baan aan in een parkeergesprek. Zijn eerste zet was geen product — het was bijna elk Apple-project stopzetten.",
      tags: ["COMEBACK", "APPLE", "FOCUS"],
    },
    profile: {
      title: "De product-purist",
      description:
        "Je geeft om smaak, focus en oprichters die het bedrijf inzetten op één visie — zelfs na verbanning.",
      traits: ["Design", "Focus", "Comeback", "Ego", "Visie", "Vakmanschap"],
    },
    journey: {
      title: "Je Apple / Jobs-reis begint",
      subtitle: "Van garage tot verbanning tot de grootste product-comeback in tech.",
      weeks: [
        { label: "Nu", title: "Jobs loopt Apple weer binnen" },
        { label: "Week 1", title: "De cuts & de Microsoft-deal" },
        { label: "Week 2", title: "iMac, iPod, iPhone-tijdperk" },
        { label: "Maand 1", title: "Volledige oprichter-bibliotheek", crown: true },
      ],
    },
    loading: {
      headline: "Je Apple-leesplan wordt samengesteld…",
      tasks: [
        "Je Jobs / Apple-interesses matchen",
        "Comeback-hoofdstukken ophalen",
        "Vergelijkbare productobsessie-saga's zoeken",
        "Tech-imperiumverhalen rangschikken",
        "5-minuten-hoofdstuktempo instellen",
        "Je watchlist afronden",
      ],
    },
  },
  theranos: {
    storyWhy: {
      title: "Wat trekt je in het Theranos / Elizabeth Holmes-verhaal?",
      options: storyWhyOptions([
        "De one-drop-of-blood-pitch",
        "Silicon Valley-hype en board-glamour",
        "Hoe toezichthouders in het duister bleven",
        "Walgreens en partner due diligence",
        "Holmes' stem, imago en verhaalcontrole",
        "De klokkenluiders die de spreuk verbraken",
      ]),
    },
    stories: {
      title: "Naast Theranos — welke fraudeverhalen interesseren je?",
    },
    depth: {
      title: "Welk deel van Theranos wil je eerst lezen?",
      options: depthOptions([
        "De oprichtingsmythe op Stanford",
        "Nepdemo's en labrealiteit",
        "Celebrity-boardleden & pers",
        "De Wall Street Journal-exposé",
      ]),
    },
    quiz: {
      question:
        "Theranos beweerde dat Edison honderden tests kon draaien van hoeveel bloed?",
      options: [
        { id: "drop", label: "Één druppel", correct: true },
        { id: "vial", label: "Een standaard buisje" },
        { id: "pinch", label: "Alleen vingerprik — geen bloed" },
        { id: "ml", label: "10 ml" },
      ],
      explanation:
        "De hele pitch draaide om één druppel — een belofte die de technologie nooit op schaal waarmaakte.",
    },
    quiz2: {
      question:
        "Theranos piekte rond welke private waardering vóór de ineenstorting?",
      options: [
        { id: "1b", label: "$1 miljard" },
        { id: "4.5b", label: "$4,5 miljard", correct: true },
        { id: "10b", label: "$10 miljard" },
        { id: "47b", label: "$47 miljard" },
      ],
      explanation:
        "Op papier ~$4,5 miljard — Theranos werd het voorbeeld van verhaal boven wetenschap.",
    },
    reveal: {
      headline: "Wat Theranos Walgreens nooit liet zien",
      record:
        "Theranos — bloedtest-startup. Opgericht door Elizabeth Holmes. Gewaardeerd op miljarden.",
      real:
        "Labresultaten draaiden vaak op commerciële machines terwijl Edison-demo's gestage protocollen gebruikten — partners en patiënten werden jarenlang misleid.",
      tags: ["FRAUDE", "HYPE", "BIOTECH"],
    },
    profile: {
      title: "De due-diligence-lezer",
      description:
        "Je wilt de kloof tussen pitchdeck en lab — waar charisma verificatie voorbij rent.",
      traits: ["Fraude", "Hype", "Wetenschap", "Boards", "Klokkenluiders", "Ethiek"],
    },
    journey: {
      title: "Je Theranos-deep-dive begint nu",
      subtitle: "Van Stanford-dropout tot miljardenleugen — hoofdstuk voor hoofdstuk.",
      weeks: [
        { label: "Nu", title: "De one-drop-pitch landt" },
        { label: "Week 1", title: "Partners, pers & board-glamour" },
        { label: "Week 2", title: "Klokkenluiders & ineenstorting" },
        { label: "Maand 1", title: "Volledige fraudeverhalen-bibliotheek", crown: true },
      ],
    },
    loading: {
      headline: "Je Theranos-leesplan wordt samengesteld…",
      tasks: [
        "Fraudeverhaal-interesses matchen",
        "Theranos-hoofdstukken ophalen",
        "Enron, FTX & vergelijkbare saga's zoeken",
        "Fraude- & roof episodes rangschikken",
        "Hoofdstuktempo instellen",
        "Watchlist afronden",
      ],
    },
  },
  nokia: {
    storyWhy: {
      title: "Waarom is de Nokia-val nog steeds relevant voor jou?",
      options: storyWhyOptions([
        "De smartphone-verschuiving missen",
        "Het iPhone-moment in 2007",
        "Inzetten op Windows Phone",
        "Hoe marktaandeel zo snel verdween",
        "Hardware-excellentie vs software-ecosysteem",
        "Een waarschuwing voor marktleiders",
      ]),
    },
    stories: {
      title: "Naast Nokia — welke businessfout-verhalen grijpen je?",
    },
    depth: {
      title: "Welk Nokia-hoofdstuk wil je eerst?",
      options: depthOptions([
        "Piekdominantie — de helft van 's werelds telefoons",
        "De iPhone-wekker",
        "Interne cultuur & bureaucratie",
        "Het Microsoft-alliantie en de afschrijving",
      ]),
    },
    quiz: {
      question:
        "Op het hoogtepunt rond 2007 had Nokia ongeveer welk aandeel van de wereldwijde telefoonverkoop?",
      options: [
        { id: "20", label: "~20%" },
        { id: "40", label: "~40%" },
        { id: "50", label: "~50%", correct: true },
        { id: "70", label: "~70%" },
      ],
      explanation:
        "Nokia was de koning van mobiel — tot smartphones de categorie overnight herschreven.",
    },
    quiz2: {
      question:
        "Nokia verkocht zijn telefoonbusiness uiteindelijk aan welk bedrijf?",
      options: [
        { id: "apple", label: "Apple" },
        { id: "google", label: "Google" },
        { id: "microsoft", label: "Microsoft", correct: true },
        { id: "samsung", label: "Samsung" },
      ],
      explanation:
        "De Microsoft-deal sloot een hoofdstuk — maar kon de smartphone-miss niet terugdraaien.",
    },
    reveal: {
      headline: "Wat Nokia's board-notulen nooit hardop zeiden",
      record:
        "Nokia — 's werelds grootste telefoonmaker. Dominant door de jaren 2000. Verstoord door smartphones.",
      real:
        "Teams zagen de iPhone-dreiging vroeg — maar bureaucratie, angst om Symbian te kannibaliseren en trage beslissingen kostten de toekomst.",
      tags: ["DISRUPTIE", "IPHONE", "MISSER"],
    },
    profile: {
      title: "De incumbent-scepticus",
      description:
        "Je bestudeert hoe leiders aan de top de bocht missen — wanneer succes de volgende zet onmogelijk voelt.",
      traits: ["Disruptie", "Cultuur", "Snelheid", "Ecosysteem", "Hoogmoed", "Lessen"],
    },
    journey: {
      title: "Je Nokia-waarschuwingstale begint",
      subtitle: "Van wereldwijde koning tot case study in het missen van de toekomst.",
      weeks: [
        { label: "Nu", title: "Piek-Nokia — onstuitbaar?" },
        { label: "Week 1", title: "iPhone-schok & intern debat" },
        { label: "Week 2", title: "Windows-weddenschap & verval" },
        { label: "Maand 1", title: "Volledige foutverhalen-bibliotheek", crown: true },
      ],
    },
    loading: {
      headline: "Je Nokia-leespad wordt in kaart gebracht…",
      tasks: [
        "Disruptie-interesses analyseren",
        "Nokia-hoofdstukken ophalen",
        "Blockbuster-achtige misses zoeken",
        "Strategiefout-saga's rangschikken",
        "Hoofdstuktempo instellen",
        "Watchlist samenstellen",
      ],
    },
  },
};

export function buildFallbackStoryFunnelCopyNl(
  storyName: string,
  teaser: { category: string; hook: string; description: string }
): Lp6StoryFunnelCopy {
  const category = teaser.category.toLowerCase();
  const isFraud = category.includes("fraud") || category.includes("fraude") || category.includes("heist");
  const isFall = category.includes("fall") || category.includes("collapse") || category.includes("ondergang");
  const isFounder = category.includes("founder") || category.includes("oprichter");

  const whyLabels = isFraud
    ? [
        `Hoe ${storyName} de visie verkocht`,
        "Het geld en de leugens",
        "Wie geloofde — en wie de klok luidde",
        "Toezichthouders, partners en blinde vlekken",
        "Het moment dat het verhaal barstte",
        "Wat het leert over due diligence",
      ]
    : isFall
      ? [
          `Hoe ${storyName} zo snel steeg`,
          "De hype en de headlines",
          "Hoogmoed in de boardroom",
          "De cijfers die niemand wilde zien",
          `Hoe ${storyName} instortte`,
          "Lessen voor de volgende cyclus",
        ]
      : isFounder
        ? [
            `De oprichtersweddenschap achter ${storyName}`,
            "Vroege beslissingen die schaalden — of braken",
            "Ego, visie en druk",
            "De deal die alles veranderde",
            "Rivalen, partners en verraad",
            "De nalatenschap die bleef",
          ]
        : [
            `De strategische zetten achter ${storyName}`,
            "Geld, macht en marktverschuivingen",
            "Het drama achter de headlines",
            "Wat investeerders nooit zagen",
            "Hoe het imperium werd gebouwd — of brak",
            "Lessen die je echt kunt gebruiken",
          ];

  const depthLabels = [
    `Het begin — voordat ${storyName} beroemd was`,
    "De beslissing waar iedereen over twist",
    "De rivalen en de machtsspelletjes",
    "Het gevolg — wat daarna gebeurde",
  ];

  const descriptionBody = teaser.description
    .replace(/^Read /i, "")
    .replace(/^Lees /i, "");

  return {
    storyWhy: {
      title: `Waarom wil je het ${storyName}-verhaal lezen?`,
      options: storyWhyOptions(whyLabels),
    },
    stories: {
      title: `Naast ${storyName} — welke andere businessverhalen spreken je aan?`,
    },
    depth: {
      title: `Welk deel van het ${storyName}-verhaal wil je eerst?`,
      options: depthOptions(depthLabels),
    },
    quiz: {
      question: `Klopt dit: "${teaser.hook}"?`,
      options: [
        {
          id: "true",
          label: "Dat is de kernspanning — ik wil het volledige verhaal",
          correct: true,
        },
        { id: "myth", label: "Klinkt overdreven — laat me de bewijzen zien" },
        { id: "new", label: "Ik ken dit verhaal nauwelijks" },
        {
          id: "expert",
          label: "Ik ken de headlines — ik wil wat niet werd gerapporteerd",
        },
      ],
      explanation: descriptionBody || teaser.hook,
    },
    quiz2: {
      question: `Hoe diep wil je in ${storyName} duiken?`,
      options: [
        { id: "5", label: "Eén hoofdstuk van 5 minuten om te starten" },
        {
          id: "arc",
          label: "De volledige boog — opkomst, keerpunt en gevolg",
          correct: true,
        },
        { id: "compare", label: "Vergelijk met vergelijkbare saga's in de bibliotheek" },
        { id: "lessons", label: "Alleen de strategische lessen" },
      ],
      explanation: `Elk ${storyName}-hoofdstuk is onderzocht, geïllustreerd en gebouwd om in minuten te lezen — niet uren.`,
    },
    reveal: {
      headline: `Wat de ${storyName}-headlines nooit uitlegden`,
      record: `De officiële versie van ${storyName} — gepolijst voor pers en investeerders.`,
      real: descriptionBody || teaser.hook,
      tags: [
        teaser.category.split(" ")[0]!.toUpperCase(),
        "DEEP DIVE",
        "GEVERIFIEERD",
      ],
    },
    profile: {
      title: isFraud
        ? "De fraude-tracker"
        : isFall
          ? "De opkomst-en-ondergang-lezer"
          : isFounder
            ? "De oprichter-boog-lezer"
            : "De strategie-lezer",
      description: `Je bent hier voor ${storyName} — en verhalen zoals dit waarin de echte beslissingen ver van de persberichten vielen.`,
      traits: isFraud
        ? ["Fraude", "Hype", "Due diligence", "Macht", "Geheimen", "Recht"]
        : isFall
          ? ["Hoogmoed", "Waardering", "Ineenstorting", "Drama", "Lessen", "Macht"]
          : isFounder
            ? ["Visie", "Risico", "Ego", "Schaal", "Nalatenschap", "Druk"]
            : ["Strategie", "Markten", "Leiderschap", "Waarheid", "Finance", "Risico"],
    },
    journey: {
      title: `Je ${storyName}-leesplan staat klaar`,
      subtitle: teaser.hook,
      weeks: [
        { label: "Nu", title: `Start ${storyName} — hoofdstuk 1` },
        { label: "Week 1", title: "Vergelijkbare saga's op je watchlist" },
        { label: "Week 2", title: "Diepere afleveringen over hetzelfde thema" },
        { label: "Maand 1", title: "3000+ verhalen ontgrendeld", crown: true },
      ],
    },
    loading: {
      headline: `Je ${storyName}-ervaring wordt gepersonaliseerd…`,
      tasks: [
        `Je interesse in ${storyName} analyseren`,
        "Gerelateerde businessverhalen matchen",
        "Hoofdstukken voor je watchlist rangschikken",
        "5-minuten-leestempo kalibreren",
        "Geverifieerde deep-dive-afleveringen ophalen",
        "Je plan afronden",
      ],
    },
  };
}
