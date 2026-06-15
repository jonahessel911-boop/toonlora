"use client";

import { useEffect } from "react";
import { resumeRunningGenerations } from "@/lib/creator/generateStudioPanels";

export default function ComicGenerationRunner() {
  useEffect(() => {
    resumeRunningGenerations();
  }, []);

  return null;
}
