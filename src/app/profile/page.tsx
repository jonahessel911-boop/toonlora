import { Suspense } from "react";
import ProfileApp from "@/components/profile/ProfileApp";

export const metadata = {
  title: "My Library — Toonlora",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileApp />
    </Suspense>
  );
}
