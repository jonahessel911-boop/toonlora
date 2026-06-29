import type { Metadata } from "next";
import EpisodePreviewClient from "@/components/story/EpisodePreviewClient";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;
  return <EpisodePreviewClient id={id} />;
}
