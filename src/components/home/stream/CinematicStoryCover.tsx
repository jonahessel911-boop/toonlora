"use client";

import { useState } from "react";

interface CinematicStoryCoverProps {
  coverArtUrl?: string;
  title: string;
  sagaLabel?: string;
  className?: string;
}

/** Dark cinematic fallback — no generic letter placeholders. */
export default function CinematicStoryCover({
  coverArtUrl,
  title,
  sagaLabel,
  className = "",
}: CinematicStoryCoverProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(coverArtUrl) && !failed;

  if (showPhoto) {
    return (
      <img
        src={coverArtUrl}
        alt=""
        className={`h-full w-full object-cover object-center ${className}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }

  const seed = title.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = seed % 360;

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#151A23] ${className}`}
    >
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, hsla(${hue}, 55%, 35%, 0.45), transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.25), transparent 45%),
            linear-gradient(145deg, #1c2230 0%, #151a23 100%)
          `,
        }}
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNCkiLz48L3N2Zz4=')] opacity-40" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        {sagaLabel ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#A7B0BE]">
            {sagaLabel}
          </p>
        ) : null}
        <p className="mt-1 font-heading text-lg font-extrabold leading-tight text-[#F9FAFB]">
          {title}
        </p>
      </div>
    </div>
  );
}
