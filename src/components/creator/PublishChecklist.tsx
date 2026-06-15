"use client";

import type { StudioStory } from "@/types/creator";
import { useCreatorStore } from "@/store/useCreatorStore";

interface PublishChecklistProps {
  story: StudioStory;
  onPublish: () => void;
}

export default function PublishChecklist({
  story,
  onPublish,
}: PublishChecklistProps) {
  const getCharacter = useCreatorStore((s) => s.getCharacter);
  const communityUsed = story.characterIds.filter((id) => {
    const ch = getCharacter(id);
    return ch && ch.creatorName !== "You";
  });

  const checks = [
    { ok: Boolean(story.title && story.description), label: "Title & description" },
    { ok: story.episodes.length > 0, label: "At least 1 episode" },
    { ok: Boolean(story.coverGradient), label: "Cover exists" },
    { ok: story.characterIds.length > 0, label: "Characters attached" },
    { ok: Boolean(story.audienceRating), label: "Content rating selected" },
    { ok: Boolean(story.visibility), label: "Visibility selected" },
  ];

  const allOk = checks.every((c) => c.ok);

  return (
    <div className="rounded-[32px] border border-[#E7D8FF] bg-white p-6 shadow-[0_8px_32px_rgba(83,64,255,0.08)]">
      <h3 className="font-heading text-xl font-extrabold text-[#2A114B]">
        Publish checklist
      </h3>
      <ul className="mt-4 space-y-2">
        {checks.map((c) => (
          <li
            key={c.label}
            className="flex items-center gap-2 text-sm text-[#667085]"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                c.ok ? "bg-[#DFF6DD] text-[#107C10]" : "bg-[#F3ECFF] text-[#667085]"
              }`}
            >
              {c.ok ? "✓" : "·"}
            </span>
            {c.label}
          </li>
        ))}
      </ul>

      {communityUsed.length > 0 ? (
        <div className="mt-5 rounded-2xl bg-[#F3ECFF] p-4">
          <p className="text-xs font-bold text-[#5340FF]">
            Characters used in this story
          </p>
          <ul className="mt-2 space-y-1">
            {communityUsed.map((id) => {
              const ch = getCharacter(id);
              return ch ? (
                <li key={id} className="text-sm text-[#2A114B]">
                  {ch.name} by {ch.creatorName}
                </li>
              ) : null;
            })}
          </ul>
          <p className="mt-2 text-[10px] text-[#667085]">
            Featuring public characters by the Toonlora community.
          </p>
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        <p className="text-xs font-bold text-[#2A114B]">Publish settings</p>
        <label className="flex items-center gap-2 text-xs text-[#667085]">
          <input type="checkbox" defaultChecked={story.allowComments} />
          Allow comments
        </label>
        <label className="flex items-center gap-2 text-xs text-[#667085]">
          <input
            type="checkbox"
            defaultChecked={story.requireAttribution}
          />
          Require attribution for public characters
        </label>
        <label className="flex items-center gap-2 text-xs text-[#667085]">
          <input
            type="checkbox"
            defaultChecked={story.allowInspiredVersions}
          />
          Allow inspired versions (off by default)
        </label>
      </div>

      <button
        type="button"
        disabled={!allOk}
        onClick={onPublish}
        className="mt-6 w-full rounded-2xl bg-[#FF6847] py-3 text-sm font-bold text-white disabled:opacity-40"
      >
        Publish to Toonlora
      </button>
    </div>
  );
}
