import { Suspense } from "react";
import StoryReaderClient from "@/components/StoryReaderClient";

interface ReadPageProps {
  params: Promise<{ id: string }>;
}

function ReadLoading() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#12091F]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
    </div>
  );
}

export default async function StoryReadPage({ params }: ReadPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<ReadLoading />}>
      <StoryReaderClient id={id} />
    </Suspense>
  );
}
