import { Suspense } from "react";
import SubscribePageClient from "@/components/subscribe/SubscribePageClient";

function SubscribeLoading() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#FCFAFF]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E7D8FF] border-t-[#5340FF]" />
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<SubscribeLoading />}>
      <SubscribePageClient />
    </Suspense>
  );
}
