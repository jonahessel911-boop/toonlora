import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterPageClient from "@/components/onboarding/RegisterPageClient";

export const metadata: Metadata = {
  title: "Start reading — Toonlora",
};

function RegisterLoading() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#F6F1E7]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E7DDCC] border-t-[#2F80ED]" />
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
