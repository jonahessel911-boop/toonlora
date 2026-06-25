import type { Metadata } from "next";
import NetflixHomeLanding from "@/components/home/netflix/NetflixHomeLanding";

export const metadata: Metadata = {
  title: "Toonlora — Unlimited business stories in cartoon format",
  description:
    "Business stories you actually want to binge. Chapter 1 free. Weekly illustrated chapters about founders, empires, and billion-dollar decisions.",
};

export default function HomeLandingPage() {
  return <NetflixHomeLanding />;
}
