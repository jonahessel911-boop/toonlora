/** Rules for Claude when writing panel caption / narration text (script step). */
export const CAPTION_WRITING_RULES = `CAPTION LANGUAGE (mandatory for every caption_text / caption):
- Write for a general audience — plain, clear, everyday English anyone can understand
- Reading level: grade 8 or below. Short sentences. Common words only.
- Say what happened directly: who did what, when, where, and why it matters
- Sound like a sharp Netflix documentary narrator — NOT a literary novel
- DO NOT use poetic, dramatic, or "fancy" phrasing
- DO NOT use metaphors or personification (e.g. "death found him", "grief's only antidote", "speed became grief's escape")
- DO NOT use rare or formal words (antidote, remembrance, lament, solemn, denouement, epitaph, corpus, thereafter, henceforth, etc.)
- DO use concrete facts: names, years, numbers, places, and simple action verbs
- One clear idea per sentence. If you need two sentences, keep both simple
- Max 20 words total, max 3 short lines — must fit a large caption box without tiny text
- Put dialogue in dialogue_text only — never in caption_text

BAD caption: "Speed became grief's only antidote — the faster he went, the less he remembered."
GOOD caption: "1917. Enzo started test-driving for CMN in Milan. Driving fast was the only thing that helped him forget his family's loss."

BAD caption: "His mother gave Enzo her son's corpse emblem — not for victory, but for remembrance."
GOOD caption: "In 1918, ace pilot Francesco Baracca died in combat. His mother later gave Enzo the prancing horse emblem from Baracca's plane."`;
