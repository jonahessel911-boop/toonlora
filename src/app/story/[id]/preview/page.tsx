import EpisodePreviewClient from "@/components/story/EpisodePreviewClient";

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;
  return <EpisodePreviewClient id={id} />;
}
