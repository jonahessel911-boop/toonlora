"use client";

interface PromptEditorProps {
  value: string;
  locked?: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
}

export default function PromptEditor({
  value,
  locked,
  onChange,
  onSave,
}: PromptEditorProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-[#667085]">
          Image prompt
        </span>
        {locked ? (
          <span className="rounded-full bg-[#F3ECFF] px-2 py-0.5 text-[10px] font-bold text-[#5340FF]">
            Locked
          </span>
        ) : null}
      </div>
      <textarea
        value={value}
        readOnly={locked}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full resize-y rounded-2xl border border-[#E7D8FF] bg-[#FCFAFF] px-3 py-2.5 font-mono text-xs leading-relaxed text-[#2A114B] outline-none ring-[#5340FF]/30 focus:ring-2 disabled:opacity-80"
      />
      {!locked ? (
        <button
          type="button"
          onClick={onSave}
          className="mt-2 rounded-xl border border-[#E7D8FF] px-3 py-1.5 text-xs font-semibold text-[#5340FF] hover:bg-[#F3ECFF]"
        >
          Save prompt edits
        </button>
      ) : null}
    </div>
  );
}
