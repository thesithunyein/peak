import Image from "next/image";
import Link from "next/link";
import { Nav, PeakBackground } from "@/components/ui";

const STEPS = [
  { number: "01", title: "Drop in your export", body: "Bring your post history from X analytics. It is free and takes a minute." },
  { number: "02", title: "Find the pattern", body: "Peak separates the posts that moved from the ones that missed and explains the difference." },
  { number: "03", title: "Post with intent", body: "Get a week of drafts shaped by your own winners, ready to copy or send." },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden text-ink">
      <PeakBackground />
      <Nav />
      <main className="relative z-10 mx-auto flex w-full max-w-[1180px] flex-1 px-5 pb-14 sm:px-8">
        <section className="glass-shell relative flex min-h-[calc(100vh-112px)] w-full flex-col items-center justify-center overflow-hidden rounded-[30px] px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-indigo-200/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/65 blur-3xl" />
          <div className="relative z-10 flex max-w-3xl flex-col items-center">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-[20px] bg-[#11121b] shadow-xl shadow-slate-900/15">
              <Image src="/logo.png" alt="Peak" width={54} height={54} className="logo-mark" priority />
            </div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-[#5a5ff0]">Personal content intelligence</p>
            <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-7xl">
              Find your peak.<br />
              <span className="text-[#5a5ff0]">Post it again.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-dim sm:text-lg">
              Peak reads your post history, tells you why the weak ones died, and writes your next week from the ones that worked.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/app?sample=1" className="inline-flex items-center justify-center rounded-full bg-[#171827] px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-[#25263a]">
                Explore with sample data <span className="ml-2">↗</span>
              </Link>
              <Link href="/app" className="inline-flex items-center justify-center rounded-full border border-white/90 bg-white/70 px-6 py-3 text-sm font-semibold text-[#27283a] shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
                Use my export
              </Link>
            </div>
          </div>

          <div className="relative z-10 mt-16 grid w-full max-w-4xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="glass-card rounded-[20px] p-5">
                <span className="text-xs font-bold text-[#5a5ff0]">{step.number}</span>
                <h2 className="mt-3 text-sm font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-dim">{step.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="relative z-10 mx-auto flex w-full max-w-[1180px] items-center justify-between px-8 pb-6 text-xs font-medium text-dim">
        <span>Peak</span>
        <span>Built by Sithu Nyein</span>
      </footer>
    </div>
  );
}
