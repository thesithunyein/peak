"use client";

import { useState } from "react";
import type { Draft, Report } from "@/lib/types";
import { Button, Card, ErrorNote, SectionLabel, Spinner } from "./ui";

const COUNTS = [3, 5, 7, 10, 14];

export function GenerateStep({ report, onDone, onBack }: { report: Report; onDone: (drafts: Draft[]) => void; onBack: () => void }) {
  const [count, setCount] = useState(7);
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ report, count, focus }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Generation failed.");
      onDone(data.drafts as Draft[]);
    } catch (e) { setError(e instanceof Error ? e.message : "Generation failed."); } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a5ff0]">Step 03 · Create</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Draft next week</h1><p className="mt-2 text-sm leading-6 text-dim sm:text-base">Posts shaped by your winning pattern, in your voice. Edit anything after.</p></div>
        <Button variant="ghost" onClick={onBack}>Back</Button>
      </div>
      <Card className="mt-8 p-6">
        <SectionLabel>How many posts</SectionLabel>
        <div className="mt-4 flex flex-wrap gap-2">{COUNTS.map((n) => <button key={n} onClick={() => setCount(n)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${count === n ? "border-[#171827] bg-[#171827] text-white" : "border-white/90 bg-white/55 text-dim hover:bg-white"}`}>{n}</button>)}</div>
        <div className="mt-7"><SectionLabel>Topic, optional</SectionLabel><input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. my new dev tool, or leave blank for a general week" className="mt-3 w-full rounded-2xl border border-white/90 bg-white/65 px-4 py-3 text-sm text-ink outline-none placeholder:text-slate-400 focus:border-[#5a5ff0] focus:ring-4 focus:ring-indigo-100" /></div>
      </Card>
      <div className="mt-7 flex justify-center"><Button onClick={generate} disabled={loading} className="px-6 py-3">{loading ? <Spinner /> : null}{loading ? "Writing drafts" : "Draft next week"} <span>↗</span></Button></div>
      <div className="mt-4"><ErrorNote message={error ?? ""} /></div>
    </div>
  );
}
