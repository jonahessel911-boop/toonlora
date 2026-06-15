"use client";

import Link from "next/link";
import { useCreatorStore } from "@/store/useCreatorStore";

export default function ComicGenerationBanner() {
  const jobs = useCreatorStore((s) => s.generationJobs);
  const dismissGenerationJob = useCreatorStore((s) => s.dismissGenerationJob);

  const visible = jobs.filter(
    (j) => j.status === "running" || j.status === "completed"
  );

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 border-b border-[#E7D8FF] bg-white px-4 py-3 md:px-6">
      {visible.map((job) => (
        <div
          key={job.id}
          className={`rounded-2xl border px-4 py-3 ${
            job.status === "completed"
              ? "border-[#DFF6DD] bg-[#F6FFF5]"
              : "border-[#E7D8FF] bg-[#F3ECFF]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#2A114B]">
                {job.status === "completed"
                  ? `✓ ${job.title} is ready`
                  : `Creating ${job.title}…`}
              </p>
              <p className="mt-0.5 text-[10px] text-[#667085]">{job.message}</p>
              {job.status === "running" ? (
                <div className="mt-2">
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[#5340FF] transition-all duration-500"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-bold text-[#5340FF]">
                    {job.progress}%
                    {job.panelCount > 0
                      ? ` · panel ${job.completedPanels} of ${job.panelCount}`
                      : ""}
                  </p>
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-2">
              {job.status === "completed" ? (
                <>
                  <Link
                    href={`/creator/editor/${job.storyId}`}
                    className="rounded-xl bg-[#5340FF] px-3 py-2 text-xs font-bold text-white"
                  >
                    Open editor
                  </Link>
                  <button
                    type="button"
                    onClick={() => dismissGenerationJob(job.id)}
                    className="rounded-xl border border-[#E7D8FF] px-3 py-2 text-xs font-bold text-[#667085]"
                  >
                    Dismiss
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
