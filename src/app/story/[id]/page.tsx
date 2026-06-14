import SeriesDetailClient from "@/components/story/SeriesDetailClient";

interface StoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;

  return <SeriesDetailClient id={id} />;
}
