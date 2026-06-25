import { Suspense } from "react";
import ContinueSignupPageClient from "@/components/auth/ContinueSignupPageClient";

function SignupLoading() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#F6F1E7]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E7DDCC] border-t-[#2F80ED]" />
    </div>
  );
}

export default function ContinueSignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <ContinueSignupPageClient />
    </Suspense>
  );
}
