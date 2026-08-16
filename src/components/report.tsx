"use client";

import type { AnalyzedPost, Report } from "@/lib/types";
import { hourLabel } from "@/lib/metrics";
import { Badge, Button, Card, SectionLabel } from "./ui";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function clip(text: string, max = 220): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function HitCard({ post }: { post: AnalyzedPost }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone="hit">hit · {post.score}x baseline</Badge>
        <span className="text-xs font-medium text-dim">
          {fmt(post.impressions)} views · {fmt(post.engagements)} engagements
        </span>
      </div>
      <p className="mt-4 text-[15px] leading-7 text-ink">{clip(post.text)}</p>
    </Card>
  );
}

function MissCard({ post }: { post: AnalyzedPost }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge tone="miss">miss · {post.score}x baseline</Badge>
        <span className="text-xs font-medium text-dim">
          {fmt(post.impressions)} views · {fmt(post.engagements)} engagements
        </span>
      </div>
      <p className="mt-4 text-[15px] leading-7 text-ink">{clip(post.text)}</p>
      <p className="mt-4 rounded-2xl border border-rose-200/75 bg-rose-50/75 px-4 py-3 text-sm leading-6 text-miss">
        {post.why}
      </p>
    </Card>
  );
}

export function ReportStep({
  report,
  onGenerate,
  onBack,
}: {
  report: Report;
  onGenerate: () => void;
  onBack: () => void;
}) {
  const { hits, misses, recipe, baseline } = report;
  const average = Math.max(report.validCount - hits.length - misses.length, 0);
  const total = Math.max(report.validCount, 1);
  const missPct = (misses.length / total) * 100;
  const hitPct = (hits.length / total) * 100;
  const avgPct = 100 - missPct - hitPct;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a5ff0]">Step 02 · Diagnose</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {hits.length} posts found their peak.
          </h1>
          <p className="mt-2 text-sm text-dim sm:text-base">
            You posted {report.postCount} times. {hits.length} hit, {misses.length} missed.
          </p>
        </div>
        <Button variant="ghost" onClick={onBack}>New import</Button>
      </div>

      {!report.enoughData && (
        <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-800">
          Need at least 10 posts with impressions to call hits and misses. This file has {report.validCount}. The recipe below is a rough read.
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-5"><p className="text-xs font-semibold text-dim">Median rate</p><p className="mt-2 text-3xl font-semibold tracking-tight">{baseline.medianRate}%</p><p className="mt-1 text-xs text-dim">your baseline</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold text-dim">Strong posts</p><p className="mt-2 text-3xl font-semibold tracking-tight text-hit">{hits.length}</p><p className="mt-1 text-xs text-dim">top quartile</p></Card>
        <Card className="p-5"><p className="text-xs font-semibold text-dim">Posts to learn from</p><p className="mt-2 text-3xl font-semibold tracking-tight text-miss">{misses.length}</p><p className="mt-1 text-xs text-dim">bottom quartile</p></Card>
      </div>

      <div className="mt-6">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/65 ring-1 ring-white/80">
          <div style={{ width: `${missPct}%` }} className="bg-rose-400" />
          <div style={{ width: `${avgPct}%` }} className="bg-slate-300/80" />
          <div style={{ width: `${hitPct}%` }} className="bg-emerald-400" />
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-dim">
          <span><span className="text-miss">●</span> {misses.length} miss</span>
          <span><span className="text-slate-400">●</span> {average} average</span>
          <span><span className="text-hit">●</span> {hits.length} hit</span>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4"><SectionLabel>Recipe from your winners</SectionLabel><span className="text-xs text-dim">Your repeatable pattern</span></div>
        <Card className="mt-3 grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div><p className="text-xs font-medium text-dim">Open with</p><p className="mt-1 font-semibold">{recipe.topOpenings.length > 0 ? recipe.topOpenings.map((o) => o.pattern).join(", ") : "Any strong opening"}</p></div>
          <div><p className="text-xs font-medium text-dim">Length</p><p className="mt-1 font-semibold">{recipe.idealLength.max > 0 ? `${recipe.idealLength.min}–${recipe.idealLength.max} chars` : "Any length"}</p></div>
          <div><p className="text-xs font-medium text-dim">Hashtags</p><p className="mt-1 font-semibold">{recipe.idealHashtagCount} per post</p></div>
          <div><p className="text-xs font-medium text-dim">Best days</p><p className="mt-1 font-semibold">{recipe.bestDays.length > 0 ? recipe.bestDays.join(", ") : "Any day"}</p></div>
          <div><p className="text-xs font-medium text-dim">Best hours</p><p className="mt-1 font-semibold">{recipe.bestHours.length > 0 ? recipe.bestHours.map(hourLabel).join(", ") : "Any hour"}</p></div>
          <div><p className="text-xs font-medium text-dim">Media</p><p className="mt-1 font-semibold">{recipe.usesMedia ? "Media helps" : "Text does fine"}</p></div>
        </Card>
      </section>

      {hits.length > 0 && <section className="mt-10"><SectionLabel>What worked</SectionLabel><div className="mt-3 grid grid-cols-1 gap-3">{hits.slice(0, 6).map((p) => <HitCard key={p.id} post={p} />)}</div></section>}
      {misses.length > 0 && <section className="mt-10"><SectionLabel>What died, and why</SectionLabel><div className="mt-3 grid grid-cols-1 gap-3">{misses.slice(0, 8).map((p) => <MissCard key={p.id} post={p} />)}</div></section>}

      <div className="mt-10 flex justify-center"><Button onClick={onGenerate} className="px-6 py-3">Draft next week <span>↗</span></Button></div>
    </div>
  );
}
