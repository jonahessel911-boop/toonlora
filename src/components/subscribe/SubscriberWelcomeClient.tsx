"use client";

import { useSearchParams } from "next/navigation";
import SubscriberWelcomeFlow from "@/components/subscribe/SubscriberWelcomeFlow";

export default function SubscriberWelcomeClient() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscriptionId");

  return <SubscriberWelcomeFlow subscriptionId={subscriptionId} />;
}
