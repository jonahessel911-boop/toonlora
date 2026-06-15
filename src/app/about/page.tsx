import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { BRAND_TAGLINE } from "@/lib/brand";

export const metadata = {
  title: `About — ${APP_NAME}`,
  description:
    "Toonlora helps readers discover engaging cartoon stories and gives everyone the tools to create and share their own episodes across Europe.",
};

const PILLARS = [
  {
    icon: "📚",
    title: "Browse engaging stories",
    body: "Discover cartoon and webtoon episodes across romance, fantasy, anime, comedy, drama, and more — curated for every niche and mood.",
    gradient: "from-[#5340FF] to-[#7C3AED]",
  },
  {
    icon: "✨",
    title: "Everyone is a creator",
    body: "Turn your idea into a cartoon episode in minutes. No studio required — just your imagination, our tools, and a little Toonlora magic.",
    gradient: "from-[#6D4CFF] to-[#5340FF]",
  },
  {
    icon: "🌍",
    title: "Share across Europe",
    body: "Publish your story to our growing network of 100,000 readers and creators across Europe — read for free, create with credits.",
    gradient: "from-[#22D3EE] to-[#5340FF]",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="bg-[#FCFAFF]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E7D8FF]">
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#5340FF] via-[#6D4CFF] to-[#2A114B]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#FF4FA3]/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#22D3EE]/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center sm:py-20 lg:py-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
            What we do
          </p>
          <h1 className="font-heading mt-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Stories for everyone.
            <br />
            Creators everywhere.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Toonlora is a cartoon and webtoon platform where readers browse
            engaging content across different niches — and anyone can become a
            creator, build their own story, and share it with our network of{" "}
            <span className="font-bold text-[#FFE033]">100,000 users</span> across
            Europe.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/#rankings"
              className="btn-coral h-14 min-w-[180px] px-8 text-base font-extrabold"
            >
              Start reading
            </Link>
            <Link
              href="/create"
              className="inline-flex h-14 min-w-[180px] items-center justify-center rounded-full border-2 border-white/40 bg-white/10 px-8 text-base font-extrabold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Create a story
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-extrabold text-[#2A114B] sm:text-3xl">
            How Toonlora works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#667085] sm:text-base">
            {BRAND_TAGLINE} We built a platform that puts great reading first —
            and makes creating your own episode feel exciting, not intimidating.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-[24px] border border-[#E7D8FF] bg-white shadow-[0_16px_48px_rgba(83,64,255,0.08)]"
            >
              <div
                className={`flex h-28 items-center justify-center bg-gradient-to-br ${item.gradient} text-4xl`}
              >
                {item.icon}
              </div>
              <div className="p-6">
                <h3 className="font-heading text-lg font-extrabold text-[#2A114B]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#667085]">
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Network strip */}
      <section className="border-y border-[#E7D8FF] bg-gradient-to-r from-[#F3ECFF] via-white to-[#F3ECFF]">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-12 text-center sm:flex-row sm:text-left">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5340FF] to-[#2A114B] text-3xl shadow-lg">
            🌍
          </div>
          <div>
            <h2 className="font-heading text-xl font-extrabold text-[#2A114B] sm:text-2xl">
              A European community of 100,000 storytellers & readers
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#667085] sm:text-base">
              Whether you&apos;re here to binge free episodes or publish your
              first cartoon series, you&apos;re part of a creative network built
              for discovery, expression, and sharing — from first panel to final
              cliffhanger.
            </p>
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="mx-auto max-w-4xl px-6 py-14 text-center sm:py-16">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#5340FF]">
          Join Toonlora
        </p>
        <h2 className="font-heading mt-2 text-2xl font-extrabold text-[#2A114B]">
          Read free. Create when you&apos;re ready.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-[#667085]">
          Episode 1 is always free. Create a free account to save your library,
          follow new releases, and share your stories with the community.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/signup/register"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#5340FF] px-8 text-sm font-bold text-white"
          >
            Create free account
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#E7D8FF] px-8 text-sm font-bold text-[#5340FF]"
          >
            Back to home
          </Link>
        </div>
      </section>
    </div>
  );
}
