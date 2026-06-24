"use client";

interface ReferenceImageStripProps {
  urls?: string[];
}

export default function ReferenceImageStrip({ urls = [] }: ReferenceImageStripProps) {
  if (urls.length === 0) {
    return (
      <p className="text-xs text-[#667085]">
        No reference images — first scene or prior scenes not generated yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {urls.map((url, i) => (
        <div
          key={`${url}-${i}`}
          className="overflow-hidden rounded-xl border border-[#E7D8FF] bg-[#FCFAFF]"
        >
          <img
            src={url}
            alt={`Reference ${i + 1}`}
            className="h-16 w-12 object-cover"
          />
        </div>
      ))}
    </div>
  );
}
