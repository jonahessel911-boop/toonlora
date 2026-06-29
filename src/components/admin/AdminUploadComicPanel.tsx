"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ADMIN_GRADIENTS,
  AdminAlert,
  AdminField,
  AdminGenreSelect,
  AdminInput,
  AdminPrimaryButton,
  AdminTextarea,
  DEFAULT_PLATFORM_GENRE,
  GradientPicker,
} from "@/components/admin/adminUi";

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function AdminUploadComicPanel({
  onPublished,
  onCancel,
}: {
  onPublished?: () => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<string>(DEFAULT_PLATFORM_GENRE);
  const [synopsis, setSynopsis] = useState("");
  const [creatorName, setCreatorName] = useState("Toonlora Official");
  const [featuredRank, setFeaturedRank] = useState("");
  const [coverGradient, setCoverGradient] = useState<string>(ADMIN_GRADIENTS[0].class);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
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

  const resetForm = () => {
    setTitle("");
    setSynopsis("");
    setGenre(DEFAULT_PLATFORM_GENRE);
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
        `"${data.story?.title ?? title}" published with ${data.panelCount} panels.`
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
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#EDEBE9] bg-white shadow-sm">
      <div className="border-b border-[#EDEBE9] bg-[#FAF9F8] px-5 py-4">
        <h3 className="text-sm font-semibold text-[#323130]">New comic — upload panels</h3>
        <p className="mt-1 text-xs text-[#605E5C]">
          Fill in the basics, add images in reading order, then publish.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <AdminField label="Title">
            <AdminInput
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Series title"
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
            placeholder="Short synopsis for the series page"
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
              Panels ({items.length})
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
            className={`flex min-h-[100px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition ${
              dragOver
                ? "border-[#0078D4] bg-[#EFF6FC]"
                : "border-[#D2D0CE] bg-[#FAF9F8] hover:border-[#0078D4]/50"
            }`}
          >
            {items.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-[#323130]">
                  Drop panel images or click to browse
                </p>
                <p className="mt-1 text-xs text-[#605E5C]">
                  Order = reader order · PNG, JPG, WebP
                </p>
              </>
            ) : (
              <div className="flex w-full gap-2 overflow-x-auto pb-1">
                {items.map((item, index) => (
                  <div key={item.id} className="relative shrink-0">
                    <img
                      src={item.previewUrl}
                      alt={`Panel ${index + 1}`}
                      className="h-20 w-14 rounded-md object-cover ring-1 ring-[#EDEBE9]"
                    />
                    <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0078D4] text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#A4262C] text-[10px] text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </button>
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
            <AdminField label="Featured rank" hint="Lower = higher on homepage">
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
        <AdminPrimaryButton
          type="submit"
          variant="success"
          loading={uploading}
          disabled={!canSubmit}
        >
          {uploading ? "Publishing…" : `Publish${items.length ? ` (${items.length} panels)` : ""}`}
        </AdminPrimaryButton>
      </div>
    </form>
  );
}
