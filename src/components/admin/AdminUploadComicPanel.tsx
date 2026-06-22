"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GENRES = [
  "Romance",
  "Anime",
  "Fantasy",
  "Comedy",
  "Drama",
  "Adventure",
  "Slice of Life",
];

const GRADIENTS = [
  "from-[#5340FF] via-[#7C3AED] to-[#FF4FA3]",
  "from-[#FF6847] via-[#FF4FA3] to-[#5340FF]",
  "from-[#22D3EE] via-[#5340FF] to-[#2A114B]",
  "from-[#FFE033] via-[#FF6847] to-[#FBBF24]",
];

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function AdminUploadComicPanel({
  onPublished,
}: {
  onPublished?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [synopsis, setSynopsis] = useState("");
  const [creatorName, setCreatorName] = useState("Toonlora Official");
  const [featuredRank, setFeaturedRank] = useState("");
  const [coverGradient, setCoverGradient] = useState(GRADIENTS[0]);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);

  const revokePreviews = useCallback(() => {
    for (const url of previewUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    previewUrlsRef.current = [];
  }, []);

  useEffect(() => () => revokePreviews(), [revokePreviews]);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const next: UploadItem[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) continue;
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.push(previewUrl);
      next.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl,
      });
    }
    setItems((prev) => [...prev, ...next]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (url) => url !== target.previewUrl
        );
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const resetForm = () => {
    setTitle("");
    setSynopsis("");
    revokePreviews();
    setItems([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("genre", genre);
      formData.set("synopsis", synopsis.trim());
      formData.set("creator_display_name", creatorName.trim());
      formData.set("cover_gradient", coverGradient);
      formData.set("publish", "true");
      if (featuredRank.trim()) {
        formData.set("featured_rank", featuredRank.trim());
      }
      for (const item of items) {
        formData.append("images", item.file);
      }

      const res = await fetch("/api/admin/series/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setMessage(
        `Published "${data.story?.title ?? title}" with ${data.panelCount} panels in reader order.`
      );
      resetForm();
      onPublished?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const canSubmit =
    title.trim().length > 0 && synopsis.trim().length > 0 && items.length > 0;

  return (
    <section className="border border-[#EDEBE9] bg-white shadow-[0_1.6px_3.6px_rgba(0,0,0,0.13)]">
      <div className="border-b border-[#EDEBE9] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#323130]">
          Upload comic panels
        </h2>
        <p className="mt-1 text-xs text-[#605E5C]">
          Add title, description, and panel images. Panels appear in the reader
          top-to-bottom in upload order (reorder below if needed).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-[#323130] sm:col-span-2">
            Series title
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
              placeholder="My new webtoon"
            />
          </label>
          <label className="block text-xs font-semibold text-[#323130]">
            Genre
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-[#323130]">
            Creator credit
            <input
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-semibold text-[#323130] sm:col-span-2">
            Description / synopsis
            <textarea
              required
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={3}
              className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
              placeholder="What is this story about?"
            />
          </label>
          <label className="block text-xs font-semibold text-[#323130]">
            Featured rank (optional)
            <input
              type="number"
              value={featuredRank}
              onChange={(e) => setFeaturedRank(e.target.value)}
              className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
              placeholder="1"
            />
          </label>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#323130]">Cover gradient</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GRADIENTS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setCoverGradient(g)}
                className={`h-10 w-16 rounded bg-gradient-to-br ${g} ring-2 ${
                  coverGradient === g ? "ring-[#0078D4]" : "ring-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded border border-dashed border-[#8A8886] bg-[#FAF9F8] p-4">
          <p className="text-xs font-semibold text-[#323130]">Panel images</p>
          <p className="mt-1 text-[11px] text-[#605E5C]">
            Select multiple images at once — order in the file picker is kept.
            First image = panel 1 in the reader.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
            className="mt-3 block w-full text-sm text-[#323130] file:mr-3 file:border-0 file:bg-[#0078D4] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
          />
        </div>

        {items.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#323130]">
              {items.length} panel{items.length !== 1 ? "s" : ""} — reader order
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="overflow-hidden border border-[#EDEBE9] bg-[#FAF9F8]"
                >
                  <div className="relative aspect-[3/4] bg-[#F3F2F1]">
                    <img
                      src={item.previewUrl}
                      alt={`Panel ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                    <span className="absolute left-2 top-2 rounded bg-[#0078D4] px-2 py-0.5 text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 border-t border-[#EDEBE9] px-2 py-1.5">
                    <p className="truncate text-[11px] text-[#605E5C]">
                      {item.file.name}
                    </p>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveItem(index, -1)}
                        className="px-1.5 text-xs text-[#0078D4] disabled:opacity-30"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={() => moveItem(index, 1)}
                        className="px-1.5 text-xs text-[#0078D4] disabled:opacity-30"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="px-1.5 text-xs text-[#A4262C]"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm text-[#A4262C]">{error}</p> : null}
        {message ? <p className="text-sm text-[#107C10]">{message}</p> : null}

        <button
          type="submit"
          disabled={uploading || !canSubmit}
          className="bg-[#107C10] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B5A0B] disabled:opacity-50"
        >
          {uploading
            ? `Uploading ${items.length} panel${items.length !== 1 ? "s" : ""}…`
            : `Publish uploaded comic (${items.length || 0} panels)`}
        </button>
      </form>
    </section>
  );
}
