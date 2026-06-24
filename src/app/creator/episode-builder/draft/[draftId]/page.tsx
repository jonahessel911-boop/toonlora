import EpisodeDraftReader from "@/components/creator/episode-builder/EpisodeDraftReader";

export const metadata = {
  title: "Episode draft — Toonlora Studio",
  description: "Preview an Episode Builder draft in reader mode.",
};

interface DraftPageProps {
  params: Promise<{ draftId: string }>;
}

export default async function EpisodeDraftPage({ params }: DraftPageProps) {
  const { draftId } = await params;
  return <EpisodeDraftReader draftId={draftId} />;
}
