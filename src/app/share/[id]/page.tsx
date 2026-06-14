import StoryReaderClient from "@/components/StoryReaderClient";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-groen-mint/20 to-surface-soft">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <StoryReaderClient id={id} isPublic />
      </div>
    </div>
  );
}
