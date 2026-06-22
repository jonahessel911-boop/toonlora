"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Story } from "@/types/story";
import { getEpisodePanelUrls } from "@/lib/admin/uploadedStoryBuilder";
import {
  ADMIN_GRADIENTS,
  AdminAlert,
  AdminField,
  AdminGenreSelect,
  AdminInput,
  AdminPrimaryButton,
  AdminTextarea,
  GradientPicker,
} from "@/components/admin/adminUi";

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
  const [genre, setGenre] = useState("Fantasy");
  const [synopsis, setSynopsis] = useState("");
  const [creatorName, setCreatorName] = useState("Toonlora Official");
  const [featuredRank, setFeaturedRank] = useState("");
  const [coverGradient, setCoverGradient] = useState<string>(ADMIN_GRADIENTS[0].class);
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
        setGenre(String(story.genre));
        setSynopsis(story.synopsis ?? story.prompt ?? "");
        setCreatorName(story.creatorDisplayName ?? "Toonlora Official");
        setFeaturedRank(
          story.featuredRank != null ? String(story.featuredRank) : ""
        );
        setCoverGradient(story.coverGradient || ADMIN_GRADIENTS[0].class);

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
      formData.set("cover_gradient", coverGradient);
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
          <AdminField label="Genre">
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
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-[#323130]">
              Panels ({panels.length})
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-[#0078D4] hover:underline"
            >
              + Add images
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
            className={`mb-3 flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-5 text-center transition ${
              dragOver
                ? "border-[#0078D4] bg-[#EFF6FC]"
                : "border-[#D2D0CE] bg-[#FAF9F8]"
            }`}
          >
            <p className="text-sm font-semibold text-[#323130]">
              Drop new panel images here
            </p>
          </button>

          {panels.length > 0 ? (
            <div className="max-h-[min(55vh,480px)] space-y-2 overflow-y-auto rounded-xl border border-[#EDEBE9] bg-[#08040F] p-2">
              {panels.map((panel, index) => (
                <div
                  key={panel.id}
                  className="group relative overflow-hidden rounded-lg bg-[#1a1028]"
                >
                  <img
                    src={panel.previewUrl}
                    alt={`Panel ${index + 1}`}
                    className="block w-full"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/75 to-transparent p-2">
                    <span className="rounded-md bg-[#0078D4] px-2 py-0.5 text-[11px] font-bold text-white">
                      {index + 1}
                      {panel.kind === "new" ? " · new" : ""}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => movePanel(index, -1)}
                        className="rounded bg-white/90 px-2 py-0.5 text-xs font-bold disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === panels.length - 1}
                        onClick={() => movePanel(index, 1)}
                        className="rounded bg-white/90 px-2 py-0.5 text-xs font-bold disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removePanel(panel.id)}
                        className="rounded bg-[#A4262C] px-2 py-0.5 text-xs font-bold text-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-[#605E5C]">
              No panels — add at least one image.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-xs font-semibold text-[#0078D4] hover:underline"
        >
          {showAdvanced ? "Hide" : "Show"} advanced options
        </button>

        {showAdvanced ? (
          <div className="grid gap-4 rounded-lg border border-[#EDEBE9] bg-[#FAF9F8] p-4 md:grid-cols-2">
            <AdminField label="Featured rank">
              <AdminInput
                type="number"
                min={1}
                value={featuredRank}
                onChange={(e) => setFeaturedRank(e.target.value)}
                placeholder="Optional"
              />
            </AdminField>
            <AdminField label="Cover gradient">
              <GradientPicker value={coverGradient} onChange={setCoverGradient} />
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
