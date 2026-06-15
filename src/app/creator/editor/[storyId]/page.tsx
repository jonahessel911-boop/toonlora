"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import CreatorTopbar from "@/components/creator/CreatorTopbar";
import EditorGenerationBanner from "@/components/creator/EditorGenerationBanner";
import PanelEditor from "@/components/creator/PanelEditor/PanelEditor";
import { useCreatorStore } from "@/store/useCreatorStore";

export default function CreatorEditorPage() {
  const params = useParams();
  const storyId = params.storyId as string;
  const setEditorContext = useCreatorStore((s) => s.setEditorContext);

  useEffect(() => {
    if (storyId) setEditorContext(storyId);
  }, [storyId, setEditorContext]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#FCFAFF]">
      <CreatorTopbar title="Panel editor" />
      <EditorGenerationBanner />
      <PanelEditor storyId={storyId} />
    </div>
  );
}
