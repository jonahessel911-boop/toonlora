import Image from "next/image";
import { ART_STYLES } from "@/lib/artStyles";

interface ArtStylePickerProps {
  value: string;
  onChange: (styleId: string) => void;
}

export default function ArtStylePicker({ value, onChange }: ArtStylePickerProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#323130]">Art style</p>
      <p className="mt-0.5 text-[11px] text-[#605E5C]">
        Controls how episode panels and cover art are generated.
      </p>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {ART_STYLES.map((style) => {
          const selected = value === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              className={`group w-[108px] shrink-0 text-left transition sm:w-[120px] ${
                selected ? "" : "opacity-90 hover:opacity-100"
              }`}
            >
              <div
                className={`relative overflow-hidden rounded-xl ring-2 transition ${
                  selected
                    ? "ring-[#0078D4] shadow-[0_8px_24px_rgba(0,120,212,0.25)]"
                    : "ring-[#EDEBE9] group-hover:ring-[#C8C6C4]"
                }`}
              >
                <Image
                  src={style.preview}
                  alt={style.label}
                  width={240}
                  height={300}
                  className="aspect-[4/5] w-full object-cover"
                />
                {selected ? (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-[#0078D4] px-1.5 py-0.5 text-[9px] font-bold text-white">
                    ✓
                  </span>
                ) : null}
              </div>
              <p
                className={`mt-1.5 text-center text-[11px] font-semibold ${
                  selected ? "text-[#0078D4]" : "text-[#323130]"
                }`}
              >
                {style.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
