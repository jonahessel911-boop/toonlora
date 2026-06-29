"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Story } from "@/types/story";
import { getEpisodePanelUrls } from "@/lib/admin/uploadedStoryBuilder";
import {
  AdminAlert,
  AdminField,
  AdminGenreSelect,
  AdminInput,
  AdminPrimaryButton,
  AdminTextarea,
  DEFAULT_PLATFORM_GENRE,
} from "@/components/admin/adminUi";
import { resolvePipelineSlug } from "@/lib/browseCategories";

type EditorPanel =
  | { id: string; kind: "existing"; url: string; previewUrl: string }
  | { id: string; kind: "new"; file: File; previewUrl: string };

export default function AdminEpisodeEditor({
  seriesId,
  episodeNumber = 1,
  onSaved,
  onCancel,
}: {
  seriesId: string;
  episodeNumber?: number;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<string>(DEFAULT_PLATFORM_GENRE);
  const [synopsis, setSynopsis] = useState("");
  const [creatorName, setCreatorName] = useState("Toonlora Official");
  const [featuredRank, setFeaturedRank] = useState("");
  const [panels, setPanels] = useState<EditorPanel[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);

  const revokeBlobUrls = useCallback(() => {
    for (const url of blobUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    blobUrlsRef.current = [];
  }, []);

  useEffect(() => () => revokeBlobUrls(), [revokeBlobUrls]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/series/${seriesId}`);
        const data = (await res.json()) as { story?: Story; error?: string };
        if (!res.ok || !data.story) {
          throw new Error(data.error ?? "Failed to load series");
        }
        if (cancelled) return;

        const story = data.story;
        const episode =
          story.episodes?.find((ep) => ep.episodeNumber === episodeNumber) ??
          story.episodes?.[0];

        setTitle(story.title);
        setGenre(resolvePipelineSlug(String(story.genre ?? story.category)));
        setSynopsis(story.synopsis ?? story.prompt ?? "");
        setCreatorName(story.creatorDisplayName ?? "Toonlora Official");
        setFeaturedRank(
          story.featuredRank != null ? String(story.featuredRank) : ""
        );

        const urls = episode ? getEpisodePanelUrls(episode) : [];
        setPanels(
          urls.map((url, index) => ({
            id: `existing-${index}-${url.slice(-12)}`,
            kind: "existing" as const,
            url,
            previewUrl: url,
          }))
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [seriesId, episodeNumber]);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const next: EditorPanel[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) continue;
      const previewUrl = URL.createObjectURL(file);
      blobUrlsRef.current.push(previewUrl);
      next.push({
        id: `new-${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        kind: "new",
        file,
        previewUrl,
      });
    }
    setPanels((prev) => [...prev, ...next]);
  };

  const removePanel = (id: string) => {
    setPanels((prev) => {
      const target = prev.find((panel) => panel.id === id);
      if (target?.kind === "new") {
        URL.revokeObjectURL(target.previewUrl);
        blobUrlsRef.current = blobUrlsRef.current.filter(
          (url) => url !== target.previewUrl
        );
      }
      return prev.filter((panel) => panel.id !== id);
    });
  };

  const movePanel = (index: number, direction: -1 | 1) => {
    setPanels((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (panels.length === 0) {
      setError("Add at least one panel image");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const newFiles: File[] = [];
      const slots = panels.map((panel) => {
        if (panel.kind === "existing") {
          return { type: "existing" as const, url: panel.url };
        }
        const index = newFiles.length;
        newFiles.push(panel.file);
        return { type: "new" as const, index };
      });

      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("genre", genre);
      formData.set("synopsis", synopsis.trim());
      formData.set("creator_display_name", creatorName.trim());
      formData.set("episode_number", String(episodeNumber));
      formData.set("panels", JSON.stringify(slots));
      if (featuredRank.trim()) {
        formData.set("featured_rank", featuredRank.trim());
      }
      for (const file of newFiles) {
        formData.append("images", file);
      }

      const res = await fetch(`/api/admin/series/${seriesId}/episode`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      setMessage(`Episode updated — ${data.panelCount} panels saved.`);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-[#EDEBE9] bg-white px-6 py-16 text-center text-sm text-[#605E5C]">
        Loading episode…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#EDEBE9] bg-white shadow-sm">
      <div className="border-b border-[#EDEBE9] bg-[#FAF9F8] px-5 py-4">
        <h3 className="text-sm font-semibold text-[#323130]">
          Edit episode {episodeNumber}
        </h3>
        <p className="mt-1 text-xs text-[#605E5C]">
          Update story details and reorder, replace, or add panel images.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <AdminField label="Title">
            <AdminInput
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </AdminField>
          <AdminField label="Category">
            <AdminGenreSelect
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </AdminField>
          <AdminField label="Creator">
            <AdminInput
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
            />
          </AdminField>
        </div>

        <AdminField label="Description">
          <AdminTextarea
            required
            rows={2}
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
          />
        </AdminField>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-[#323130]">
              Panels ({panels.length}) — use ↑ ↓ to change reading order
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md bg-[#0078D4] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#106EBE]"
            >
              + Add panel
            </button>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`mb-3 flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-4 text-center transition ${
              dragOver
                ? "border-[#0078D4] bg-[#EFF6FC]"
                : "border-[#D2D0CE] bg-[#FAF9F8]"
            }`}
          >
            <p className="text-sm font-semibold text-[#323130]">
              Drop images here to add panels
            </p>
            <p className="mt-1 text-xs text-[#605E5C]">
              New panels are added at the end — reorder with the arrows
            </p>
          </button>

          {panels.length > 0 ? (
            <ul className="max-h-[min(60vh,520px)] space-y-2 overflow-y-auto rounded-lg border border-[#EDEBE9] bg-[#FAF9F8] p-2">
              {panels.map((panel, index) => (
                <li
                  key={panel.id}
                  className="flex items-center gap-3 rounded-lg border border-[#EDEBE9] bg-white p-2 shadow-sm"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0078D4] text-[11px] font-bold text-white">
                    {index + 1}
                  </span>

                  <div className="relative h-[72px] w-[52px] shrink-0 overflow-hidden rounded-md border border-[#EDEBE9] bg-[#1a1028]">
                    <img
                      src={panel.previewUrl}
                      alt={`Panel ${index + 1}`}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#323130]">
                      Panel {index + 1}
                    </p>
                    <p className="truncate text-[11px] text-[#605E5C]">
                      {panel.kind === "new"
                        ? panel.file.name
                        : "Saved image"}
                    </p>
                    {panel.kind === "new" ? (
                      <span className="mt-0.5 inline-block rounded bg-[#EFF6FC] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0078D4]">
                        New
                      </span>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => movePanel(index, -1)}
                      title="Move up"
                      className="flex h-7 w-7 items-center justify-center rounded border border-[#EDEBE9] bg-[#FAF9F8] text-xs font-bold text-[#323130] hover:bg-[#F3F2F1] disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === panels.length - 1}
                      onClick={() => movePanel(index, 1)}
                      title="Move down"
                      className="flex h-7 w-7 items-center justify-center rounded border border-[#EDEBE9] bg-[#FAF9F8] text-xs font-bold text-[#323130] hover:bg-[#F3F2F1] disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removePanel(panel.id)}
                    title="Remove panel"
                    className="shrink-0 rounded px-2 py-1 text-[11px] font-semibold text-[#A4262C] hover:bg-[#FDE7E9]"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-xs text-[#605E5C]">
              No panels yet — add at least one image.
            </p>
          )}

          {panels.length > 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 w-full rounded-lg border border-dashed border-[#D2D0CE] bg-white py-2.5 text-xs font-semibold text-[#0078D4] hover:border-[#0078D4] hover:bg-[#EFF6FC]"
            >
              + Add another panel
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-xs font-semibold text-[#0078D4] hover:underline"
        >
          {showAdvanced ? "Hide" : "Show"} advanced options
        </button>

        {showAdvanced ? (
          <div className="rounded-lg border border-[#EDEBE9] bg-[#FAF9F8] p-4">
            <AdminField label="Featured rank">
              <AdminInput
                type="number"
                min={1}
                value={featuredRank}
                onChange={(e) => setFeaturedRank(e.target.value)}
                placeholder="Optional — lower numbers appear first on homepage"
              />
            </AdminField>
          </div>
        ) : null}

        {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
        {message ? <AdminAlert type="success">{message}</AdminAlert> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDEBE9] bg-[#FAF9F8] px-5 py-4">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold text-[#605E5C] hover:text-[#323130]"
          >
            ← Back to catalog
          </button>
        ) : (
          <span />
        )}
        <AdminPrimaryButton type="submit" loading={saving} disabled={panels.length === 0}>
          {saving ? "Saving…" : "Save episode"}
        </AdminPrimaryButton>
      </div>
    </form>
  );
}
