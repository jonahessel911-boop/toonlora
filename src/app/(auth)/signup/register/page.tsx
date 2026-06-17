import { Suspense } from "react";
import RegisterPageClient from "@/components/onboarding/RegisterPageClient";

function RegisterLoading() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#FCFAFF]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E7D8FF] border-t-[#5340FF]" />
    </div>
  );
}

export default function SignupRegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterPageClient />
    </Suspense>
  );
}
