import type { TextBubble } from "@/types/pipeline";

interface SpeechBubbleProps {
  bubble: TextBubble;
}

export default function SpeechBubble({ bubble }: SpeechBubbleProps) {
  const { type, speaker, text, position } = bubble;

  if (type === "sfx") {
    return (
      <div
        className="absolute font-black uppercase tracking-wider text-gray-900"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: "translate(-50%, -50%)",
          fontSize: "clamp(14px, 4vw, 22px)",
          textShadow: "2px 2px 0 white, -1px -1px 0 white",
        }}
      >
        {text}
      </div>
    );
  }

  if (type === "narration") {
    return (
      <div
        className="absolute rounded-lg border border-border/60 bg-white/85 px-3 py-2 text-center shadow-sm backdrop-blur-sm"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          width: `${position.width}%`,
          transform: "translate(-50%, 0)",
        }}
      >
        <p className="font-serif text-xs italic leading-relaxed text-gray-700 sm:text-sm">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${position.width}%`,
        transform: "translate(-50%, 0)",
      }}
    >
      <div className="relative rounded-2xl border-2 border-gray-900 bg-white px-3 py-2 shadow-md">
        {speaker && (
          <p className="mb-0.5 text-[10px] font-black uppercase tracking-wide text-groen-deep sm:text-xs">
            {speaker}
          </p>
        )}
        <p className="text-xs font-bold leading-snug text-gray-900 sm:text-sm">
          {text}
        </p>
        <div
          className={`absolute -bottom-2 h-3 w-3 rotate-45 border-b-2 border-r-2 border-gray-900 bg-white ${
            bubble.tail_direction === "bottom-right"
              ? "right-4"
              : bubble.tail_direction === "top-left"
                ? "left-4 top-0 -translate-y-full"
                : bubble.tail_direction === "top-right"
                  ? "right-4 top-0 -translate-y-full"
                  : "left-4"
          }`}
        />
      </div>
    </div>
  );
}
