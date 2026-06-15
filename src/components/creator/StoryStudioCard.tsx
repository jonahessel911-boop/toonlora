"use client";

import type { StudioStory } from "@/types/creator";
import { useCreatorStore } from "@/store/useCreatorStore";

const STATUS_STYLES = {
  draft: "bg-[#F3ECFF] text-[#5340FF]",
  published: "bg-[#DFF6DD] text-[#107C10]",
  private: "bg-[#FFF8E8] text-[#667085]",
};

interface StoryStudioCardProps {
  story: StudioStory;
  onEdit: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onAddEpisode: () => void;
  onChangeCover: () => void;
}

export default function StoryStudioCard({
  story,
  onEdit,
  onPreview,
  onPublish,
  onAddEpisode,
  onChangeCover,
}: StoryStudioCardProps) {
  const getCharacter = useCreatorStore((s) => s.getCharacter);
  const updated = new Date(story.updatedAt).toLocaleDateString();

  return (
    <article className="group overflow-hidden rounded-[24px] border border-[#E7D8FF] bg-white shadow-[0_4px_20px_rgba(83,64,255,0.06)] transition hover:shadow-[0_8px_28px_rgba(83,64,255,0.12)]">
      <div
        className={`relative aspect-[3/4] bg-gradient-to-br ${story.coverGradient}`}
      >
        {story.coverUrl ? (
          <img
            src={story.coverUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col justify-end p-4">
            <span className="inline-flex w-fit rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#5340FF]">
              {story.genre}
            </span>
            <p className="mt-2 font-heading text-lg font-extrabold text-white drop-shadow">
              {story.title}
            </p>
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_STYLES[story.status]}`}
        >
          {story.status}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-heading text-base font-extrabold text-[#2A114B]">
          {story.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-[#667085]">
          {story.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold text-[#667085]">
          <span>{story.episodes.length} ep</span>
          <span>·</span>
          <span>
            {story.characterIds.length} character
            {story.characterIds.length !== 1 ? "s" : ""}
          </span>
          <span>·</span>
          <span>{story.reads} reads</span>
          <span>·</span>
          <span>{story.likes} likes</span>
        </div>

        <p className="mt-1 text-[10px] text-[#667085]">Edited {updated}</p>

        <div className="mt-2 flex flex-wrap gap-1">
          {story.characterIds.slice(0, 3).map((id) => {
            const ch = getCharacter(id);
            return ch ? (
              <span
                key={id}
                className="rounded-full bg-[#F3ECFF] px-2 py-0.5 text-[10px] font-bold text-[#5340FF]"
              >
                {ch.name}
              </span>
            ) : null;
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl bg-[#5340FF] px-3 py-1.5 text-xs font-bold text-white"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onAddEpisode}
            className="rounded-xl border border-[#E7D8FF] px-3 py-1.5 text-xs font-bold text-[#5340FF]"
          >
            Add episode
          </button>
          <button
            type="button"
            onClick={onChangeCover}
            className="rounded-xl border border-[#E7D8FF] px-3 py-1.5 text-xs font-bold text-[#667085]"
          >
            Cover
          </button>
          {story.status !== "published" ? (
            <button
              type="button"
              onClick={onPublish}
              className="rounded-xl bg-[#FF6847] px-3 py-1.5 text-xs font-bold text-white"
            >
              Publish
            </button>
          ) : null}
          <button
            type="button"
            onClick={onPreview}
            className="rounded-xl border border-[#E7D8FF] px-3 py-1.5 text-xs font-bold text-[#667085]"
          >
            Preview
          </button>
        </div>
      </div>
    </article>
  );
}
