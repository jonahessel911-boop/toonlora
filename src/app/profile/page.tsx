import ProfileApp from "@/components/profile/ProfileApp";

export const metadata = {
  title: "My Library — Toonlora",
};

export default function ProfilePage() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <ProfileApp />
    </div>
  );
}
