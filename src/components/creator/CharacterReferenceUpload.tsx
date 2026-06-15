"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

interface CharacterReferenceUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

async function readImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file (JPG, PNG, or WebP).");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 2 MB.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

export default function CharacterReferenceUpload({
  images,
  onChange,
  maxImages = 3,
}: CharacterReferenceUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const addFiles = async (files: FileList | File[]) => {
    setError("");
    const list = Array.from(files);
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} reference images.`);
      return;
    }

    try {
      const added: string[] = [];
      for (const file of list.slice(0, remaining)) {
        added.push(await readImageFile(file));
      }
      onChange([...images, ...added]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-[#2A114B]">Reference image</p>
        <span className="text-[10px] text-[#667085]">Optional · guides AI look</span>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((src, i) => (
            <div
              key={`${src.slice(0, 32)}-${i}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#E7D8FF] bg-[#F3ECFF]"
            >
              <img
                src={src}
                alt={`Reference ${i + 1}`}
                className="h-full w-full object-cover"
              />
              {i === 0 ? (
                <span className="absolute left-2 top-2 rounded-full bg-[#5340FF] px-2 py-0.5 text-[9px] font-bold text-white">
                  Primary
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {images.length < maxImages ? (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 transition ${
            dragOver
              ? "border-[#5340FF] bg-[#F3ECFF]"
              : "border-[#E7D8FF] bg-white hover:border-[#5340FF]/50 hover:bg-[#FCFAFF]"
          }`}
        >
          <span className="text-2xl">🖼</span>
          <p className="mt-2 text-sm font-bold text-[#2A114B]">
            Upload reference image
          </p>
          <p className="mt-1 text-center text-xs text-[#667085]">
            Drag & drop or click · JPG, PNG, WebP · max 2 MB
          </p>
          <p className="mt-2 text-center text-[10px] text-[#667085]">
            Use a photo, sketch, or character art — AI uses this for face,
            outfit, and style.
          </p>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        multiple={maxImages > 1}
        onChange={(e) => {
          if (e.target.files?.length) void addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error ? <p className="text-xs text-[#A4262C]">{error}</p> : null}
    </div>
  );
}

export function isDisplayableReference(url: string): boolean {
  return (
    url.startsWith("data:image/") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/")
  );
}
