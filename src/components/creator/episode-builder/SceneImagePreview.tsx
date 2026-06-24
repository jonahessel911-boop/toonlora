"use client";

interface SceneImagePreviewProps {
  imageUrl?: string;
  sceneNumber: number;
  status: string;
  loading?: boolean;
}

export default function SceneImagePreview({
  imageUrl,
  sceneNumber,
  status,
  loading,
}: SceneImagePreviewProps) {
  return (
    <div className="relative aspect-[5/8] w-full max-w-[220px] overflow-hidden rounded-2xl border border-[#E7D8FF] bg-gradient-to-br from-[#F3ECFF] to-[#E9D8FD]">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Scene ${sceneNumber} preview`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center px-4 text-center">
          <span className="font-heading text-2xl font-extrabold text-[#5340FF]/40">
            {sceneNumber}
          </span>
          <p className="mt-2 text-xs text-[#667085]">
            {loading || status === "generating"
              ? "Generating…"
              : "Image preview"}
          </p>
        </div>
      )}
      {(loading || status === "generating") && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#2A114B]/20 backdrop-blur-[1px]">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#5340FF]">
            Generating…
          </span>
        </div>
      )}
    </div>
  );
}
