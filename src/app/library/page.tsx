import { Suspense } from "react";
import LibraryPageClient from "@/components/library/LibraryPageClient";

export default function LibraryPage() {
  return (
    <div className="bg-gradient-to-b from-[#F3ECFF]/40 to-[#FCFAFF]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <Suspense fallback={<div className="min-h-[40vh]" />}>
          <LibraryPageClient />
        </Suspense>
      </div>
    </div>
  );
}
