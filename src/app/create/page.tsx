import CreateStoryWizard from "@/components/create/CreateStoryWizard";

export default function CreatePage() {
  return (
    <div className="bg-gradient-to-b from-groen-mint/50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
            Create a story
          </h1>
          <p className="mt-3 text-gray-600">
            A quick guided builder — turn your idea into a shareable cartoon
            episode.
          </p>
        </div>
        <CreateStoryWizard />
      </div>
    </div>
  );
}
