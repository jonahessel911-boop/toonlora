"use client";

import {
  NEWSLETTER_TOPICS,
  type NewsletterTopic,
  toggleNewsletterTopic,
} from "@/lib/newsletter";

interface SignupNewsletterTopicCheckboxesProps {
  selected: NewsletterTopic[];
  onChange: (topics: NewsletterTopic[]) => void;
  disabled?: boolean;
}

export default function SignupNewsletterTopicCheckboxes({
  selected,
  onChange,
  disabled = false,
}: SignupNewsletterTopicCheckboxesProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-[#2A114B]">
        Select topics to receive stories from
      </p>
      <div className="space-y-2">
        {NEWSLETTER_TOPICS.map((topic) => {
          const checked = selected.includes(topic.id);
          return (
            <label
              key={topic.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition ${
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : checked
                    ? "border-[#5340FF] bg-[#F3ECFF]"
                    : "border-[#E7D8FF] bg-white hover:border-[#5340FF]/40"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() =>
                  onChange(toggleNewsletterTopic(selected, topic.id))
                }
                className="h-4 w-4 shrink-0 rounded border-[#C4B5FD] text-[#5340FF] focus:ring-[#5340FF]"
              />
              <span className="text-sm font-semibold text-[#2A114B]">
                {topic.label.replace(" Stories", "")}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
