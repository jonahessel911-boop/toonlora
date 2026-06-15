import ComicGenerationRunner from "@/components/creator/ComicGenerationRunner";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ComicGenerationRunner />
      {children}
    </>
  );
}
