"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import { STREAM_COLLECTIONS } from "@/lib/home/streamCollections";
import StreamRail from "@/components/home/stream/StreamRail";

export default function CollectionTiles() {
  return (
    <StreamRail title="Browse by topic" subtitle="Jump into a collection">
      {STREAM_COLLECTIONS.map((collection) => (
        <AffiliateLink
          key={collection.id}
          href={collection.href}
          className="group relative flex h-[120px] w-[200px] shrink-0 snap-start overflow-hidden rounded-xl bg-[#151A23] ring-1 ring-[#E6DFD1] transition hover:scale-[1.03] hover:ring-[#2F80ED]/50 sm:w-[220px]"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${collection.gradient}`}
          />
          <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10" />
          <div className="relative flex h-full flex-col justify-end p-4">
            <p className="font-heading text-lg font-extrabold text-white">
              {collection.label}
            </p>
            <p className="text-xs text-[#CBD5E1]">{collection.subtitle}</p>
          </div>
        </AffiliateLink>
      ))}
    </StreamRail>
  );
}
