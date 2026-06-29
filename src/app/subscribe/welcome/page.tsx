import { Suspense } from "react";
import SubscriberWelcomeClient from "@/components/subscribe/SubscriberWelcomeClient";

function WelcomeLoading() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#F6F1E7]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E7D8FF] border-t-[#5340FF]" />
    </div>
  );
}

export default function SubscribeWelcomePage() {
  return (
    <Suspense fallback={<WelcomeLoading />}>
      <SubscriberWelcomeClient />
    </Suspense>
  );
}
