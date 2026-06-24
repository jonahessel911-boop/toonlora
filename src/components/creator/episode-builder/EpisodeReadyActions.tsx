"use client";

interface EpisodeReadyActionsProps {
  onPreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onRegenerateAll: () => void;
  disabled?: boolean;
  savedAt: string | null;
}

export default function EpisodeReadyActions({
  onPreview,
  onSaveDraft,
  onPublish,
  onRegenerateAll,
  disabled,
  savedAt,
}: EpisodeReadyActionsProps) {
  return (
    <section className="rounded-[28px] border border-[#D1FAE5] bg-gradient-to-br from-[#ECFDF5] to-white p-5">
      <p className="font-heading text-lg font-extrabold text-[#065F46]">
        Episode ready
      </p>
      <p className="mt-1 text-sm text-[#667085]">
        Review your images, save a draft, or publish to Studio.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onPreview}
          className="rounded-2xl bg-[#5340FF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#4330EF] disabled:opacity-50"
        >
          Preview episode
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onSaveDraft}
          className="rounded-2xl border border-[#E7D8FF] bg-white px-5 py-2.5 text-sm font-semibold text-[#2A114B] hover:bg-[#FCFAFF] disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onPublish}
          className="rounded-2xl bg-[#FF6847] px-5 py-2.5 text-sm font-extrabold text-white hover:opacity-90 disabled:opacity-50"
        >
          Publish
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onRegenerateAll}
          className="rounded-2xl border border-[#5340FF]/30 px-5 py-2.5 text-sm font-semibold text-[#5340FF] hover:bg-[#F3ECFF] disabled:opacity-50"
        >
          Regenerate all
        </button>
      </div>

      {savedAt ? (
        <p className="mt-3 text-[11px] text-[#667085]">
          Draft saved {new Date(savedAt).toLocaleString()}
        </p>
      ) : null}
    </section>
  );
}
