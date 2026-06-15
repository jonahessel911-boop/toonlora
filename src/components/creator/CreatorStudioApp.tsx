"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import CreatorSidebar from "@/components/creator/CreatorSidebar";
import CreatorTopbar from "@/components/creator/CreatorTopbar";
import StudioStatCard from "@/components/creator/StudioStatCard";
import StoryStudioCard from "@/components/creator/StoryStudioCard";
import CharacterCard from "@/components/creator/CharacterCard";
import PublicCharacterCard from "@/components/creator/PublicCharacterCard";
import EmptyStudioState from "@/components/creator/EmptyStudioState";
import CreateComicModal from "@/components/creator/CreateComicModal";
import CharacterCreateModal from "@/components/creator/CharacterCreateModal";
import CoverEditor from "@/components/creator/CoverEditor";
import PublishChecklist from "@/components/creator/PublishChecklist";
import { ACTIVE_EDITOR_STORY_ID } from "@/lib/creator/mockData";
import { useCreatorStore } from "@/store/useCreatorStore";
import { useCreditsStore } from "@/store/useCreditsStore";
import type { StudioSection } from "@/types/creator";

const COMMUNITY_FILTERS = [
  "Trending",
  "Romance",
  "Fantasy",
  "Anime",
  "New",
  "Most used",
] as const;

export default function CreatorStudioApp() {
  const router = useRouter();
  const [mobileNav, setMobileNav] = useState(false);
  const [comicModal, setComicModal] = useState(false);
  const [characterModal, setCharacterModal] = useState(false);
  const [communityFilter, setCommunityFilter] =
    useState<(typeof COMMUNITY_FILTERS)[number]>("Trending");
  const [coverStoryId, setCoverStoryId] = useState<string | null>(null);
  const [publishStoryId, setPublishStoryId] = useState<string | null>(null);

  const activeSection = useCreatorStore((s) => s.activeSection);
  const setSection = useCreatorStore((s) => s.setSection);
  const stories = useCreatorStore((s) => s.stories);
  const getMyCharacters = useCreatorStore((s) => s.getMyCharacters);
  const communityCharacters = useCreatorStore((s) => s.communityCharacters);
  const analytics = useCreatorStore((s) => s.analytics);
  const createCharacterFromForm = useCreatorStore(
    (s) => s.createCharacterFromForm
  );
  const updateCharacter = useCreatorStore((s) => s.updateCharacter);
  const duplicateCharacter = useCreatorStore((s) => s.duplicateCharacter);
  const importCommunityCharacter = useCreatorStore(
    (s) => s.importCommunityCharacter
  );
  const publishStory = useCreatorStore((s) => s.publishStory);
  const updateStory = useCreatorStore((s) => s.updateStory);
  const setEditorContext = useCreatorStore((s) => s.setEditorContext);
  const getStory = useCreatorStore((s) => s.getStory);

  const { credits, hydrate } = useCreditsStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const myCharacters = getMyCharacters();
  const drafts = stories.filter((s) => s.status === "draft").length;
  const published = stories.filter((s) => s.status === "published").length;
  const privateChars = myCharacters.filter((c) => c.visibility === "private").length;
  const publicChars = myCharacters.filter((c) => c.visibility === "public").length;

  const openEditor = (storyId: string) => {
    setEditorContext(storyId);
    router.push(`/creator/editor/${storyId}`);
  };

  const sectionTitle: Record<StudioSection, string> = {
    overview: "Overview",
    stories: "My Stories",
    characters: "My Characters",
    editor: "Panel Editor",
    covers: "Covers",
    published: "Published",
    community: "Community Characters",
    analytics: "Analytics",
    settings: "Studio Settings",
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div className="rounded-[32px] border border-[#E7D8FF] bg-gradient-to-br from-white via-[#F3ECFF]/50 to-[#E9D8FD]/40 p-6 md:p-8">
              <h2 className="font-heading text-2xl font-extrabold text-[#2A114B] md:text-3xl">
                Create, edit, and publish digital comics.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[#667085] md:text-base">
                Build stories, design reusable characters, edit panels, and
                publish your comic episodes on Toonlora.
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
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StudioStatCard
                label="My Stories"
                value={stories.length}
                sub={`${drafts} drafts · ${published} published`}
                action={{
                  label: "View stories",
                  onClick: () => setSection("stories"),
                }}
              />
              <StudioStatCard
                label="My Characters"
                value={myCharacters.length}
                sub={`${privateChars} private · ${publicChars} public`}
                accent="coral"
                action={{
                  label: "Character library",
                  onClick: () => setSection("characters"),
                }}
              />
              <StudioStatCard
                label="Credits"
                value={credits}
                accent="yellow"
                action={{
                  label: "Buy credits",
                  onClick: () => {},
                }}
              />
              <StudioStatCard
                label="Performance"
                value={analytics.reads}
                sub={`${analytics.likes} likes · ${analytics.followers} followers · ${analytics.remixes} remixes`}
                accent="cyan"
                action={{
                  label: "Analytics",
                  onClick: () => setSection("analytics"),
                }}
              />
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#667085]">
                Quick actions
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Create new comic", fn: () => setComicModal(true) },
                  { label: "Create character", fn: () => setCharacterModal(true) },
                  {
                    label: "Continue draft",
                    fn: () => openEditor(ACTIVE_EDITOR_STORY_ID),
                  },
                  { label: "Add new episode", fn: () => setSection("stories") },
                  {
                    label: "Publish story",
                    fn: () => {
                      setPublishStoryId(ACTIVE_EDITOR_STORY_ID);
                      setSection("published");
                    },
                  },
                ].map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={a.fn}
                    className="rounded-2xl bg-[#F3ECFF] px-4 py-2.5 text-xs font-bold text-[#5340FF] hover:bg-[#E9D8FD]"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "stories":
        return stories.length === 0 ? (
          <EmptyStudioState
            title="Start your first comic"
            subtitle="Use your characters, generate panels, edit speech bubbles, and publish to Toonlora."
            ctaLabel="Create new comic"
            onCta={() => setComicModal(true)}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {stories.map((story) => (
              <StoryStudioCard
                key={story.id}
                story={story}
                onEdit={() => openEditor(story.id)}
                onPreview={() => router.push(`/story/${story.id}/preview`)}
                onPublish={() => {
                  setPublishStoryId(story.id);
                  setSection("published");
                }}
                onAddEpisode={() => openEditor(story.id)}
                onChangeCover={() => {
                  setCoverStoryId(story.id);
                  setSection("covers");
                }}
              />
            ))}
          </div>
        );

      case "characters":
        return myCharacters.length === 0 ? (
          <EmptyStudioState
            title="Create your first character"
            subtitle="Design a reusable character you can bring into every story."
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
                onUse={() => {
                  setComicModal(true);
                }}
                onEdit={() => setCharacterModal(true)}
                onMakePublic={() =>
                  updateCharacter(c.id, {
                    visibility: "public",
                    allowOthersToUse: true,
                  })
                }
                onDuplicate={() => duplicateCharacter(c.id)}
              />
            ))}
          </div>
        );

      case "editor":
        return (
          <div className="rounded-[32px] border border-[#E7D8FF] bg-white p-8 text-center">
            <p className="font-heading text-xl font-extrabold text-[#2A114B]">
              Panel editor
            </p>
            <p className="mt-2 text-sm text-[#667085]">
              Open a story to edit panels, speech bubbles, and narration.
            </p>
            <button
              type="button"
              onClick={() => openEditor(ACTIVE_EDITOR_STORY_ID)}
              className="mt-6 rounded-2xl bg-[#5340FF] px-6 py-3 text-sm font-bold text-white"
            >
              Open Shadow Whisper
            </button>
          </div>
        );

      case "covers": {
        const coverStory =
          getStory(coverStoryId ?? stories[0]?.id ?? "") ?? stories[0];
        if (!coverStory) return null;
        return (
          <CoverEditor
            story={coverStory}
            onUpdateGradient={(g) =>
              updateStory(coverStory.id, { coverGradient: g })
            }
          />
        );
      }

      case "published": {
        const pubStory =
          getStory(publishStoryId ?? ACTIVE_EDITOR_STORY_ID) ??
          stories.find((s) => s.status === "draft");
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-heading text-lg font-extrabold text-[#2A114B]">
                Published comics
              </h3>
              <div className="mt-4 space-y-3">
                {stories
                  .filter((s) => s.status === "published")
                  .map((s) => (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-[#E7D8FF] p-4"
                    >
                      <p className="font-bold text-[#2A114B]">{s.title}</p>
                      <p className="text-xs text-[#667085]">
                        {s.reads} reads · {s.likes} likes
                      </p>
                    </div>
                  ))}
              </div>
            </div>
            {pubStory ? (
              <PublishChecklist
                story={pubStory}
                onPublish={() => {
                  publishStory(pubStory.id);
                  setPublishStoryId(null);
                }}
              />
            ) : null}
          </div>
        );
      }

      case "community":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {COMMUNITY_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCommunityFilter(f)}
                  className={`rounded-full px-4 py-2 text-xs font-bold ${
                    communityFilter === f
                      ? "bg-[#5340FF] text-white"
                      : "bg-[#F3ECFF] text-[#5340FF]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communityCharacters.map((c, i) => (
                <PublicCharacterCard
                  key={c.id}
                  character={c}
                  trending={communityFilter === "Trending" && i < 2}
                  onUse={() => importCommunityCharacter(c.id)}
                  onView={() => {}}
                />
              ))}
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Reads", value: analytics.reads },
              { label: "Likes", value: analytics.likes },
              { label: "Followers gained", value: analytics.followers },
              { label: "Completion rate", value: `${analytics.completionRate}%` },
              { label: "Comments", value: analytics.comments },
              { label: "Inspired versions", value: analytics.inspiredVersions },
              { label: "Character uses", value: analytics.characterUses },
              { label: "Remixes", value: analytics.remixes },
            ].map((stat) => (
              <StudioStatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
              />
            ))}
          </div>
        );

      case "settings":
        return (
          <div className="max-w-lg space-y-4 rounded-[32px] border border-[#E7D8FF] bg-white p-6">
            <h3 className="font-heading text-lg font-extrabold text-[#2A114B]">
              Studio settings
            </h3>
            <label className="flex items-center justify-between text-sm">
              <span className="text-[#667085]">Default visibility</span>
              <select className="rounded-xl border border-[#E7D8FF] px-3 py-2 text-sm">
                <option>Private</option>
                <option>Public</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-[#667085]">
              <input type="checkbox" defaultChecked />
              Require attribution when using community characters
            </label>
            <label className="flex items-center gap-2 text-sm text-[#667085]">
              <input type="checkbox" />
              Allow inspired versions of my stories
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-[#FCFAFF]">
      <div className="hidden md:flex">
        <CreatorSidebar active={activeSection} onNavigate={setSection} />
      </div>

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

      <div className="flex min-w-0 flex-1 flex-col">
        <CreatorTopbar
          title={sectionTitle[activeSection]}
          onMenuOpen={() => setMobileNav(true)}
          primaryAction={{
            label: "Create new comic",
            onClick: () => setComicModal(true),
          }}
          secondaryAction={{
            label: "Create character",
            onClick: () => setCharacterModal(true),
          }}
        />

        <div className="md:hidden">
          <div className="flex gap-1 overflow-x-auto border-b border-[#E7D8FF] px-2 py-2">
            {(
              [
                "overview",
                "stories",
                "characters",
                "editor",
                "community",
              ] as StudioSection[]
            ).map((id) => (
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
                {id}
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
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

          {activeSection === "overview" ? (
            <aside className="hidden w-[280px] shrink-0 border-l border-[#E7D8FF] bg-white p-4 xl:block">
              <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Activity
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-[#F3ECFF] p-3 text-xs text-[#2A114B]">
                  <span className="font-bold text-[#5340FF]">Shadow Whisper</span>{" "}
                  draft updated today
                </div>
                <div className="rounded-2xl bg-[#FFF8E8] p-3 text-xs text-[#2A114B]">
                  <span className="font-bold text-[#FF6847]">+12 reads</span> on
                  Café Chaos
                </div>
                <div className="rounded-2xl bg-[#F3ECFF] p-3 text-xs text-[#2A114B]">
                  Sakura used in 3 community stories
                </div>
              </div>
              <button
                type="button"
                onClick={() => openEditor(ACTIVE_EDITOR_STORY_ID)}
                className="mt-4 w-full rounded-2xl bg-[#5340FF] py-2.5 text-xs font-bold text-white"
              >
                Continue editing
              </button>
            </aside>
          ) : null}
        </div>
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
    </div>
  );
}
