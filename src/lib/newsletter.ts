export type NewsletterTopic = "business";

export const NEWSLETTER_TOPICS: {
  id: NewsletterTopic;
  label: string;
}[] = [{ id: "business", label: "Business Stories" }];

export function normalizeNewsletterTopics(
  topics: NewsletterTopic[]
): NewsletterTopic[] {
  const unique = new Set<NewsletterTopic>();
  for (const topic of topics) {
    if (topic === "business") {
      unique.add(topic);
    }
  }
  return Array.from(unique);
}

export function toggleNewsletterTopic(
  topics: NewsletterTopic[],
  topic: NewsletterTopic
): NewsletterTopic[] {
  const next = new Set(topics);
  if (next.has(topic)) next.delete(topic);
  else next.add(topic);
  return normalizeNewsletterTopics(Array.from(next));
}

export function deriveDisplayNameFromEmail(email: string): string {
  const local = email.trim().split("@")[0] ?? "";
  const cleaned = local.replace(/[._+-]+/g, " ").trim();
  if (!cleaned) return "Reader";
  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
