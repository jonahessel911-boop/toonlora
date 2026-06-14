import StoryReaderClient from "@/components/StoryReaderClient";

interface ReadPageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryReadPage({ params }: ReadPageProps) {
  const { id } = await params;
  return <StoryReaderClient id={id} />;
}
