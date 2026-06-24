"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import CreatorSidebar from "@/components/creator/CreatorSidebar";
import CreatorTopbar from "@/components/creator/CreatorTopbar";
import StudioStatCard from "@/components/creator/StudioStatCard";
import StoryStudioCard from "@/components/creator/StoryStudioCard";
import CharacterCard from "@/components/creator/CharacterCard";
import EmptyStudioState from "@/components/creator/EmptyStudioState";
import CreateComicModal from "@/components/creator/CreateComicModal";
import CharacterCreateModal from "@/components/creator/CharacterCreateModal";
import CharacterDetailModal from "@/components/creator/CharacterDetailModal";
import CharacterEditModal from "@/components/creator/CharacterEditModal";
import StoryCharacterFilter from "@/components/creator/StoryCharacterFilter";
import ComicGenerationBanner from "@/components/creator/ComicGenerationBanner";
import CoinsShop from "@/components/creator/CoinsShop";
import { filterUserStories } from "@/lib/creator/mockData";
import { useCreatorStore } from "@/store/useCreatorStore";
import { useCreditsStore } from "@/store/useCreditsStore";
import type { StudioSection } from "@/types/creator";

const SECTIONS: StudioSection[] = [
  "overview",
  "stories",
  "characters",
  "settings",
];

export default function CreatorStudioApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileNav, setMobileNav] = useState(false);
  const [comicModal, setComicModal] = useState(false);
  const [characterModal, setCharacterModal] = useState(false);
  const [detailCharacterId, setDetailCharacterId] = useState<string | null>(
    null
  );
  const [editCharacterId, setEditCharacterId] = useState<string | null>(null);
  const [storyCharacterFilter, setStoryCharacterFilter] = useState<string[]>(
    []
  );

  const activeSection = useCreatorStore((s) => s.activeSection);
  const setSection = useCreatorStore((s) => s.setSection);
  const allStories = useCreatorStore((s) => s.stories);
  const stories = useMemo(
    () => filterUserStories(allStories),
    [allStories]
  );
  const getMyCharacters = useCreatorStore((s) => s.getMyCharacters);
  const createCharacterFromForm = useCreatorStore(
    (s) => s.createCharacterFromForm
  );
  const deleteCharacter = useCreatorStore((s) => s.deleteCharacter);
  const saveCharacterEdits = useCreatorStore((s) => s.saveCharacterEdits);
  const getCharacter = useCreatorStore((s) => s.getCharacter);
  const publishStory = useCreatorStore((s) => s.publishStory);
  const setEditorContext = useCreatorStore((s) => s.setEditorContext);

  const { credits, hydrate } = useCreditsStore();
  const [purchaseStatus, setPurchaseStatus] = useState<
    "success" | "cancelled" | null
  >(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const section = searchParams.get("section");
    const purchase = searchParams.get("purchase");

    if (section === "coins" || section === "settings") {
      setSection("settings");
    }

    if (purchase === "success" || purchase === "cancelled") {
      setPurchaseStatus(purchase);
      if (purchase === "success") {
        void hydrate();
      }
      router.replace("/creator", { scroll: false });
    }
  }, [searchParams, setSection, hydrate, router]);

  useEffect(() => {
    if (!SECTIONS.includes(activeSection)) {
      setSection("overview");
    }
  }, [activeSection, setSection]);

  const myCharacters = getMyCharacters();
  const detailCharacter = detailCharacterId
    ? getCharacter(detailCharacterId)
    : null;
  const editCharacter = editCharacterId ? getCharacter(editCharacterId) : null;

  const filteredStories = useMemo(() => {
    if (storyCharacterFilter.length === 0) return stories;
    return stories.filter((story) =>
      storyCharacterFilter.some((id) => story.characterIds.includes(id))
    );
  }, [stories, storyCharacterFilter]);
  const drafts = stories.filter((s) => s.status === "draft").length;
  const published = stories.filter((s) => s.status === "published").length;

  const openEditor = (storyId: string) => {
    setEditorContext(storyId);
    router.push(`/creator/editor/${storyId}`);
  };

  const sectionTitle: Record<StudioSection, string> = {
    overview: "Overview",
    stories: "Stories",
    characters: "Characters",
    settings: "Settings",
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div className="rounded-[32px] border border-[#E7D8FF] bg-gradient-to-br from-white via-[#F3ECFF]/50 to-[#E9D8FD]/40 p-6 md:p-8">
              <h2 className="font-heading text-2xl font-extrabold text-[#2A114B] md:text-3xl">
                In-depth business stories in a cartoon.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[#667085] md:text-base">
                Create characters, research a story, and publish panel by panel.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setComicModal(true)}
                  className="rounded-2xl bg-[#FF6847] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(255,104,71,0.35)]"
                >
                  Create new comic
                </button>
                <button
                  type="button"
                  onClick={() => setCharacterModal(true)}
                  className="rounded-2xl border border-[#E7D8FF] bg-white px-5 py-3 text-sm font-bold text-[#5340FF]"
                >
                  Create character
                </button>
                <Link
                  href="/creator/episode-builder"
                  className="rounded-2xl border border-[#5340FF]/30 bg-[#F3ECFF] px-5 py-3 text-sm font-bold text-[#5340FF]"
                >
                  Episode Builder
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StudioStatCard
                label="Stories"
                value={stories.length}
                sub={`${drafts} drafts · ${published} published`}
                action={{
                  label: "View stories",
                  onClick: () => setSection("stories"),
                }}
              />
              <StudioStatCard
                label="Characters"
                value={myCharacters.length}
                accent="coral"
                action={{
                  label: "View characters",
                  onClick: () => setSection("characters"),
                }}
              />
              <StudioStatCard
                label="Coins"
                value={credits}
                accent="yellow"
                action={{
                  label: "Buy coins",
                  onClick: () => setSection("settings"),
                }}
              />
            </div>

            {stories.length > 0 ? (
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Continue
                </p>
                <button
                  type="button"
                  onClick={() => openEditor(stories[0].id)}
                  className="rounded-2xl bg-[#5340FF] px-5 py-3 text-sm font-bold text-white"
                >
                  Continue latest story
                </button>
              </div>
            ) : null}
          </div>
        );

      case "stories":
        return stories.length === 0 ? (
          <EmptyStudioState
            title="Start your first comic"
            subtitle="Pick your characters, describe the episode, and generate your panels."
            ctaLabel="Create new comic"
            onCta={() => setComicModal(true)}
          />
        ) : (
          <div className="space-y-5">
            <StoryCharacterFilter
              characters={myCharacters}
              selectedIds={storyCharacterFilter}
              onChange={setStoryCharacterFilter}
            />
            {filteredStories.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#E7D8FF] bg-white p-8 text-center">
                <p className="font-heading text-base font-extrabold text-[#2A114B]">
                  No stories match this filter
                </p>
                <p className="mt-2 text-sm text-[#667085]">
                  Try selecting fewer characters or create a new comic with them.
                </p>
                <button
                  type="button"
                  onClick={() => setStoryCharacterFilter([])}
                  className="mt-4 rounded-2xl bg-[#5340FF] px-5 py-2.5 text-sm font-bold text-white"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredStories.map((story) => (
                  <StoryStudioCard
                    key={story.id}
                    story={story}
                    onEdit={() => openEditor(story.id)}
                    onPreview={() => router.push(`/story/${story.id}/preview`)}
                    onPublish={() => publishStory(story.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case "characters":
        return myCharacters.length === 0 ? (
          <EmptyStudioState
            title="Create your first character"
            subtitle="Design a reusable character for your stories."
            ctaLabel="Create character"
            onCta={() => setCharacterModal(true)}
            icon="◎"
          />
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setCharacterModal(true)}
              className="rounded-2xl bg-[#FF6847] px-4 py-2.5 text-sm font-bold text-white"
            >
              + Create character
            </button>
            {myCharacters.map((c) => (
              <CharacterCard
                key={c.id}
                character={c}
                onOpen={() => setDetailCharacterId(c.id)}
              />
            ))}
          </div>
        );

      case "settings":
        return (
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="rounded-[32px] border border-[#E7D8FF] bg-white p-6">
              <h3 className="font-heading text-lg font-extrabold text-[#2A114B]">
                Studio preferences
              </h3>
              <div className="mt-4 space-y-4">
                <label className="flex items-center justify-between text-sm">
                  <span className="text-[#667085]">Default visibility</span>
                  <select className="rounded-xl border border-[#E7D8FF] px-3 py-2 text-sm">
                    <option>Private</option>
                    <option>Public</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-[#667085]">
                  <input type="checkbox" defaultChecked />
                  Require attribution when others use my characters
                </label>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-heading text-lg font-extrabold text-[#2A114B]">
                Coins
              </h3>
              <CoinsShop
                purchaseStatus={purchaseStatus}
                onDismissStatus={() => setPurchaseStatus(null)}
                embedded
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#FCFAFF]">
      <CreatorSidebar active={activeSection} onNavigate={setSection} />

      <AnimatePresence>
        {mobileNav ? (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-[#2A114B]/40"
              onClick={() => setMobileNav(false)}
            />
            <motion.div
              className="absolute left-0 top-0 h-full w-[min(100%,280px)]"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
            >
              <CreatorSidebar
                active={activeSection}
                onNavigate={setSection}
                mobile
                onClose={() => setMobileNav(false)}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden md:ml-[240px]">
        <CreatorTopbar
          title={sectionTitle[activeSection]}
          onMenuOpen={() => setMobileNav(true)}
          onBuyCoins={() => setSection("settings")}
        />

        {!comicModal ? <ComicGenerationBanner /> : null}

        <div className="md:hidden">
          <div className="flex gap-1 overflow-x-auto border-b border-[#E7D8FF] px-2 py-2">
            {SECTIONS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold capitalize ${
                  activeSection === id
                    ? "bg-[#5340FF] text-white"
                    : "bg-[#F3ECFF] text-[#5340FF]"
                }`}
              >
                {sectionTitle[id]}
              </button>
            ))}
          </div>
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CreateComicModal
        open={comicModal}
        onClose={() => setComicModal(false)}
        onOpenCharacterModal={() => {
          setComicModal(false);
          setCharacterModal(true);
        }}
      />
      <CharacterCreateModal
        open={characterModal}
        onClose={() => setCharacterModal(false)}
        onCreate={(data) => {
          createCharacterFromForm(data);
        }}
      />
      <CharacterDetailModal
        character={detailCharacter ?? null}
        stories={stories}
        open={Boolean(detailCharacterId && detailCharacter)}
        onClose={() => setDetailCharacterId(null)}
        onEdit={(id) => setEditCharacterId(id)}
        onUseInStory={() => setComicModal(true)}
        onDelete={(id) => {
          deleteCharacter(id);
          setDetailCharacterId(null);
        }}
        onOpenStory={(storyId) => openEditor(storyId)}
      />
      <CharacterEditModal
        character={editCharacter ?? null}
        open={Boolean(editCharacterId && editCharacter)}
        onClose={() => setEditCharacterId(null)}
        onSave={(id, patch) => {
          const savedId = saveCharacterEdits(id, patch);
          setEditCharacterId(null);
          setDetailCharacterId(savedId);
          return savedId;
        }}
      />
    </div>
  );
}
