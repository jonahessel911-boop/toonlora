interface StudioStatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "purple" | "coral" | "yellow" | "cyan";
  action?: { label: string; onClick: () => void };
}

const ACCENTS = {
  purple: "from-[#5340FF]/10 to-[#E9D8FD]",
  coral: "from-[#FF6847]/10 to-[#FFE033]/20",
  yellow: "from-[#FFE033]/25 to-[#FF6847]/10",
  cyan: "from-[#22D3EE]/15 to-[#5340FF]/10",
};

export default function StudioStatCard({
  label,
  value,
  sub,
  accent = "purple",
  action,
}: StudioStatCardProps) {
  return (
    <div
      className={`rounded-[24px] border border-[#E7D8FF] bg-gradient-to-br ${ACCENTS[accent]} p-5 shadow-[0_4px_20px_rgba(83,64,255,0.06)]`}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl font-extrabold text-[#2A114B]">
        {value}
      </p>
      {sub ? (
        <p className="mt-1 text-sm text-[#667085]">{sub}</p>
      ) : null}
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 text-sm font-bold text-[#5340FF] hover:underline"
        >
          {action.label} →
        </button>
      ) : null}
    </div>
  );
}
