import type { Metadata } from "next";
import LandingPageClient from "@/components/lp/LandingPageClient";

export const metadata: Metadata = {
  title: "Toonlora — Read or Create Your Dream Story",
  description:
    "Discover free cartoon stories from the community, or turn your idea into a shareable episode in minutes.",
};

export default function LandingPage1() {
  return <LandingPageClient />;
}
