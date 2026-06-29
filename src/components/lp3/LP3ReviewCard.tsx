import type { LP3Review } from "@/lib/lp3/content";

function StarRow({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`flex h-5 w-5 items-center justify-center rounded-sm text-[11px] text-white ${
              i < full ? "bg-[#00B67A]" : "bg-[#00B67A]/35"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-sm font-extrabold text-[#0A1628]">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function LP3ReviewCard({ review }: { review: LP3Review }) {
  return (
    <article className="rounded-2xl border border-[#E7DDCC] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#0A1628]"
            style={{ backgroundColor: review.avatarColor }}
          >
            {review.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-[#0A1628]">
              {review.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#64748B]">
              <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#64748B]/15 text-[9px]">
                ✓
              </span>
              Verified
            </p>
          </div>
        </div>
        <span className="shrink-0 text-[11px] text-[#94A3B8]">
          {review.timeAgo}
        </span>
      </div>

      <div className="my-3 h-px bg-[#E7DDCC]" />

      <StarRow rating={review.rating} />

      <h4 className="mt-3 text-sm font-extrabold leading-snug text-[#0A1628]">
        {review.title}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-[#475569]">
        {review.body}
      </p>
    </article>
  );
}
