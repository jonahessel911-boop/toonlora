import Link from "next/link";
import CoverArt, { getCoverPreset } from "@/components/ui/CoverArt";

export interface StoryCardProps {
  id?: string;
  title: string;
  genre: string;
  coverGradient: string;
  coverEmoji?: string;
  rank?: number;
  date?: string;
  episodes?: number;
  readers?: string;
  likes?: string;
  creator?: string;
  isNew?: boolean;
  status?: "draft" | "published" | "new";
  href?: string;
  showActions?: boolean;
  compact?: boolean;
  onShare?: () => void;
}

export default function StoryCard({
  id,
  title,
  genre,
  coverGradient,
  rank,
  date,
  episodes = 1,
  readers,
  likes,
  creator,
  isNew,
  status,
  href,
  showActions = false,
  compact = false,
  onShare,
}: StoryCardProps) {
  const readHref = href ?? (id ? `/story/${id}` : "/create");
  const preset = getCoverPreset(genre);
  const gradient = coverGradient || preset.gradient;
  const seed = (id ?? title).split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <article
      className={`group relative ${compact ? "w-[148px] flex-shrink-0 sm:w-[168px]" : ""}`}
    >
      <Link href={readHref} className="block">
        <div className="card-shadow relative overflow-hidden rounded-2xl ring-1 ring-gs-border transition duration-300 hover:-translate-y-0.5 hover:shadow-xl">
          <CoverArt
            gradient={gradient}
            genre={genre}
            title={compact ? undefined : title}
            showOverlay
            seed={seed}
            className="aspect-[3/4] w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {(isNew || status === "new") && (
            <span className="absolute right-2 top-2 rounded-full bg-gs-accent px-2 py-0.5 text-[10px] font-bold text-white">
              New
            </span>
          )}
          {status === "draft" && (
            <span className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-white">
              Draft
            </span>
          )}
          {status === "published" && (
            <span className="absolute right-2 top-2 rounded-full bg-gs-primary px-2 py-0.5 text-[10px] font-bold text-white">
              Live
            </span>
          )}

          {rank !== undefined && (
            <span className="absolute bottom-2 left-2 text-4xl font-black leading-none text-white drop-shadow-lg sm:text-5xl">
              {rank}
            </span>
          )}

          {compact && (
            <div className="absolute bottom-2 left-2 right-2">
              <h3 className="line-clamp-2 text-sm font-extrabold leading-tight text-white drop-shadow">
                {title}
              </h3>
            </div>
          )}
        </div>
      </Link>

      <div className={`mt-2.5 space-y-1 ${compact ? "px-0.5" : ""}`}>
        {!compact && (
          <h3 className="line-clamp-2 text-sm font-bold text-gs-text group-hover:text-gs-primary-dark">
            {title}
          </h3>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gs-muted">
          <span>{episodes} ep</span>
          {readers && <span className="text-gs-primary">{readers} views</span>}
          {likes && <span>♥ {likes}</span>}
        </div>
        {creator && (
          <p className="text-[11px] text-gs-muted/80">by {creator}</p>
        )}
        {date && (
          <p className="text-[11px] text-gs-muted">
            Updated{" "}
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        )}

        {showActions ? (
          <div className="flex gap-2 pt-1">
            <Link
              href={readHref}
              className="flex-1 rounded-full bg-gs-primary-dark py-2 text-center text-xs font-bold text-white"
            >
              Read
            </Link>
            <button
              type="button"
              onClick={onShare}
              className="flex-1 rounded-full border border-gs-border py-2 text-xs font-bold text-gs-primary-dark"
            >
              Share
            </button>
          </div>
        ) : !compact ? (
          <Link
            href={readHref}
            className="inline-flex text-sm font-bold text-gs-primary hover:underline"
          >
            Read now →
          </Link>
        ) : null}
      </div>
    </article>
  );
}
