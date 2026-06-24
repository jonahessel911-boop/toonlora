import type { EpisodeStoryPlan } from "@/types/episode-builder";
import { styleModeToLabel } from "@/lib/episode-builder/constants";
import { getEpisodeBuilderDraft } from "@/lib/episode-builder/draftStorage";
import {
  getSceneChangeText,
  getSceneStoryText,
  getSceneSuggestedCopy,
} from "@/lib/episode-builder/sceneStoryText";

const PX_TO_MM = 0.264583;

async function fetchImageAsDataUrl(
  url: string
): Promise<{ dataUrl: string; width: number; height: number }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch image");
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", 0.92),
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function slugify(title: string): string {
  return title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "episode-draft";
}

export async function exportEpisodeDraftPdf(
  plan: EpisodeStoryPlan,
  onProgress?: (message: string) => void
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;

  onProgress?.("Building cover page…");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text(plan.storyTitle, margin, 28);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(60);
  pdf.text(
    `${plan.genre} · ${plan.tone} · ${styleModeToLabel(plan.styleMode)}`,
    margin,
    38
  );

  pdf.setTextColor(0);
  pdf.setFontSize(11);
  const loglineLines = pdf.splitTextToSize(plan.logline, contentW);
  pdf.text(loglineLines, margin, 48);

  let y = 48 + loglineLines.length * 5.5 + 6;
  if (plan.input.description?.trim()) {
    pdf.setFontSize(9);
    pdf.setTextColor(80);
    const premise = pdf.splitTextToSize(
      `Original premise: ${plan.input.description.trim()}`,
      contentW
    );
    pdf.text(premise, margin, y);
    y += premise.length * 4 + 4;
  }

  pdf.setFontSize(9);
  pdf.setTextColor(100);
  pdf.text(
    `Exported ${new Date().toLocaleString()} · ${plan.scenes.filter((s) => s.imageUrl).length} panels`,
    margin,
    y
  );

  for (const scene of plan.scenes) {
    if (!scene.imageUrl) continue;

    onProgress?.(`Adding image ${scene.sceneNumber}…`);
    pdf.addPage();

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(40);
    pdf.text(`Scene ${scene.sceneNumber} — ${scene.title}`, margin, 16);

    let imageBottom = 22;
    try {
      const { dataUrl, width, height } = await fetchImageAsDataUrl(scene.imageUrl);
      const imgWmm = width * PX_TO_MM;
      const imgHmm = height * PX_TO_MM;
      const maxW = contentW;
      const maxH = pageH * 0.55;
      const scale = Math.min(maxW / imgWmm, maxH / imgHmm);
      const w = imgWmm * scale;
      const h = imgHmm * scale;
      const x = margin + (contentW - w) / 2;
      pdf.addImage(dataUrl, "JPEG", x, 22, w, h);
      imageBottom = 22 + h + 8;
    } catch {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(120);
      pdf.text("Image could not be embedded in PDF.", margin, 30);
      imageBottom = 38;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(0);
    pdf.text("Story", margin, imageBottom);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(40);
    let y = imageBottom + 5;
    const storyLines = pdf.splitTextToSize(getSceneStoryText(scene), contentW);
    pdf.text(storyLines, margin, y);
    y += storyLines.length * 4 + 3;

    const change = getSceneChangeText(scene);
    if (change) {
      const changeLines = pdf.splitTextToSize(`What changes: ${change}`, contentW);
      pdf.text(changeLines, margin, y);
      y += changeLines.length * 4 + 3;
    }

    const suggested = getSceneSuggestedCopy(scene);
    if (suggested.length) {
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(60);
      pdf.text("Suggested copy (add manually):", margin, y);
      y += 5;
      pdf.setFont("helvetica", "normal");
      for (const line of suggested) {
        const lines = pdf.splitTextToSize(`· ${line}`, contentW);
        pdf.text(lines, margin, y);
        y += lines.length * 4 + 1;
      }
    }
  }

  onProgress?.("Adding production notes…");
  pdf.addPage();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(0);
  pdf.text("Production notes", margin, 18);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(80);
  pdf.text(
    "Image prompts and scene metadata for review. Panels are generated without text overlays.",
    margin,
    25
  );

  y = 32;
  for (const scene of plan.scenes) {
    const blocks: string[] = [
      `Scene ${scene.sceneNumber}: ${scene.title}`,
      `Story: ${getSceneStoryText(scene)}`,
    ];
    if (scene.imagePrompt) {
      blocks.push(`Image prompt: ${scene.imagePrompt}`);
    }

    for (const block of blocks) {
      const lines = pdf.splitTextToSize(block, contentW);
      if (y + lines.length * 3.5 > pageH - margin) {
        pdf.addPage();
        y = margin;
      }
      if (block.startsWith("Scene")) {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0);
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(40);
      }
      pdf.text(lines, margin, y);
      y += lines.length * 3.5 + 2;
    }
    y += 4;
  }

  pdf.save(`${slugify(plan.storyTitle)}-draft.pdf`);
  onProgress?.("Done");
}

export async function downloadEpisodeDraftPdfById(
  draftId: string,
  onProgress?: (message: string) => void
): Promise<void> {
  const draft = getEpisodeBuilderDraft(draftId);
  if (!draft) throw new Error("Draft not found");
  await exportEpisodeDraftPdf(draft.plan, onProgress);
}
