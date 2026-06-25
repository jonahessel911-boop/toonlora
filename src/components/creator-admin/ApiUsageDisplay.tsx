import type { ApiUsageLineItem, ApiUsageSummary } from "@/lib/api-usage-cost";
import { formatUsd } from "@/lib/api-usage-cost";

interface ApiUsageDisplayProps {
  usage: ApiUsageSummary | null | undefined;
  compact?: boolean;
}

function lineDetail(item: ApiUsageLineItem): string {
  const parts: string[] = [];
  if (item.input_tokens != null || item.output_tokens != null) {
    parts.push(
      `in ${item.input_tokens ?? 0} / out ${item.output_tokens ?? 0} tokens`
    );
  }
  if (item.input_text_tokens != null) {
    parts.push(`prompt ${item.input_text_tokens} tok`);
  }
  if (item.output_image_tokens != null) {
    parts.push(`image out ${item.output_image_tokens} tok`);
  }
  if (item.web_search_requests != null) {
    parts.push(`${item.web_search_requests} Claude web search`);
  }
  if (item.model) parts.unshift(item.model);
  return parts.join(" · ");
}

export default function ApiUsageDisplay({ usage, compact }: ApiUsageDisplayProps) {
  if (!usage?.items.length) return null;

  return (
    <div className="rounded-xl border border-[#07111F]/10 bg-[#F6F1E7]/40 p-3 text-xs">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-bold text-[#07111F]">API kosten</p>
        <p className="font-semibold text-[#07111F]">{formatUsd(usage.total_usd)}</p>
      </div>
      {!compact ? (
        <ul className="space-y-1.5 text-[#667085]">
          {usage.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span>
                <span className="font-medium text-[#07111F]">{item.operation}</span>
                {" · "}
                {lineDetail(item)}
              </span>
              <span className="shrink-0 font-medium text-[#07111F]">
                {formatUsd(item.cost_usd)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-[10px] text-[#667085]">
        Berekend uit API usage × publieke prijslijst. Je OpenAI/Anthropic factuur is leidend.
      </p>
    </div>
  );
}
