import Link from "next/link";

export default function ReadCreateSplit() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">
          Read for free. Create with credits.
        </h2>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          Discover community stories at no cost — bring your own ideas to life when
          you&apos;re ready.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <Link
          href="#discover"
          className="group rounded-3xl border-2 border-border bg-gradient-to-br from-white to-groen-mint/50 p-6 shadow-sm transition hover:border-groen-primary hover:shadow-md sm:p-8"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-border">
            📖
          </span>
          <h3 className="mt-4 text-lg font-black text-gray-900">
            Read stories from the community
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Browse trending episodes, Toonlora Originals, and creator series — all
            free to read.
          </p>
          <span className="mt-4 inline-flex text-sm font-bold text-groen-deep group-hover:underline">
            Explore stories →
          </span>
        </Link>

        <Link
          href="/create"
          className="group rounded-3xl border-2 border-groen-primary/30 bg-gradient-to-br from-groen-mint to-surface-soft p-6 shadow-sm transition hover:shadow-md sm:p-8"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-groen-primary text-2xl text-white shadow-md">
            ✨
          </span>
          <h3 className="mt-4 text-lg font-black text-gray-900">
            Create your own story in minutes
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Turn your idea into a cartoon episode. Your first story is free —
            then creation uses credits.
          </p>
          <span className="mt-4 inline-flex text-sm font-bold text-groen-deep group-hover:underline">
            Start creating →
          </span>
        </Link>
      </div>
    </section>
  );
}
