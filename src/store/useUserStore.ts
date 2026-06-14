"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserProfile {
  fullName: string;
  email: string;
  wantsRecommendations: boolean;
  agreedToTerms: boolean;
  onboarded: boolean;
}

interface UserStore extends UserProfile {
  setProfile: (data: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      fullName: "",
      email: "",
      wantsRecommendations: true,
      agreedToTerms: false,
      onboarded: false,
      setProfile: (data) => set((s) => ({ ...s, ...data })),
      completeOnboarding: () => set({ onboarded: true }),
      logout: () =>
        set({
          fullName: "",
          email: "",
          wantsRecommendations: true,
          agreedToTerms: false,
          onboarded: false,
        }),
    }),
    { name: "toonlora-user" }
  )
);
