import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/ui";

const STEPS = [
  {
    title: "Drop in your export",
    body: "Export your post history from X analytics as CSV. It is free and takes a minute.",
  },
  {
    title: "Read the report",
    body: "See which posts hit, which died, and one plain reason for each. Then read the recipe pulled from your winners.",
  },
  {
    title: "Post your next week",
    body: "Drafts written from your winning pattern, ready to copy or send to Telegram.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        <section className="flex flex-col items-center py-20 text-center sm:py-28">
          <Image
            src="/logo.png"
            alt="Peak"
            width={64}
            height={64}
            className="rounded-xl"
            priority
          />
          <h1 className="mt-8 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Find your peak. Post it again.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-dim">
            Peak reads your post history, tells you why the weak ones died, and
            writes your next week from the ones that worked.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app?sample=1"
              className="inline-flex items-center justify-center rounded-lg bg-peak px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-peak/90"
            >
              Load sample data
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-lg border border-edge bg-panel2 px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-panel"
            >
              Drop in your export
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 pb-24 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="rounded-xl border border-edge bg-panel p-6"
            >
              <span className="text-sm font-semibold text-peak">
                0{i + 1}
              </span>
              <h2 className="mt-3 text-base font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-dim">{s.body}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t border-edge">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 text-sm text-dim">
          <span>Peak</span>
          <span>Built by Sithu Nyein</span>
        </div>
      </footer>
    </div>
  );
}
