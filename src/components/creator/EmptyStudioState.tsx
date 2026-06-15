interface EmptyStudioStateProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCta: () => void;
  icon?: string;
}

export default function EmptyStudioState({
  title,
  subtitle,
  ctaLabel,
  onCta,
  icon = "✨",
}: EmptyStudioStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-[#E7D8FF] bg-gradient-to-b from-white to-[#F3ECFF]/60 px-8 py-16 text-center shadow-[0_8px_32px_rgba(83,64,255,0.06)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E9D8FD] text-2xl">
        {icon}
      </div>
      <h3 className="mt-5 font-heading text-xl font-extrabold text-[#2A114B]">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#667085]">
        {subtitle}
      </p>
      <button
        type="button"
        onClick={onCta}
        className="mt-6 rounded-2xl bg-[#FF6847] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(255,104,71,0.35)] transition hover:bg-[#ff5230]"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
