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
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <Badge tone="hit">hit · {post.score}x baseline</Badge>
        <span className="text-xs text-dim">
          {fmt(post.impressions)} views · {fmt(post.engagements)} engagements
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink">
        {clip(post.text)}
      </p>
    </Card>
  );
}

function MissCard({ post }: { post: AnalyzedPost }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <Badge tone="miss">miss · {post.score}x baseline</Badge>
        <span className="text-xs text-dim">
          {fmt(post.impressions)} views · {fmt(post.engagements)} engagements
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink">
        {clip(post.text)}
      </p>
      <p className="mt-3 rounded-lg border border-miss/20 bg-miss/5 px-3 py-2 text-sm text-miss">
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
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            You posted {report.postCount} times. {hits.length} hit,{" "}
            {misses.length} missed.
          </h1>
          <p className="mt-1 text-dim">
            Median engagement rate: {baseline.medianRate}%
          </p>
        </div>
        <Button variant="ghost" onClick={onBack}>
          New import
        </Button>
      </div>

      {!report.enoughData && (
        <div className="mt-6 rounded-lg border border-peak/25 bg-peak/10 px-4 py-3 text-sm text-peak">
          Need at least 10 posts with impressions to call hits and misses. This
          file has {report.validCount}. The recipe below is a rough read.
        </div>
      )}

      <div className="mt-6">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-edge">
          <div style={{ width: `${missPct}%` }} className="bg-miss" />
          <div style={{ width: `${avgPct}%` }} className="bg-white/10" />
          <div style={{ width: `${hitPct}%` }} className="bg-hit" />
        </div>
        <div className="mt-2 flex gap-4 text-xs text-dim">
          <span>
            <span className="text-miss">■</span> {misses.length} miss
          </span>
          <span>
            <span className="text-zinc-500">■</span> {average} average
          </span>
          <span>
            <span className="text-hit">■</span> {hits.length} hit
          </span>
        </div>
      </div>

      <section className="mt-10">
        <SectionLabel>Recipe from your winners</SectionLabel>
        <Card className="mt-3 grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-dim">Open with</p>
            <p className="mt-1 font-medium">
              {recipe.topOpenings.length > 0
                ? recipe.topOpenings.map((o) => o.pattern).join(", ")
                : "Any strong opening"}
            </p>
          </div>
          <div>
            <p className="text-xs text-dim">Length</p>
            <p className="mt-1 font-medium">
              {recipe.idealLength.max > 0
                ? `${recipe.idealLength.min} to ${recipe.idealLength.max} chars, median ${recipe.idealLength.median}`
                : "Any length"}
            </p>
          </div>
          <div>
            <p className="text-xs text-dim">Hashtags</p>
            <p className="mt-1 font-medium">
              {recipe.idealHashtagCount} per post
            </p>
          </div>
          <div>
            <p className="text-xs text-dim">Best days</p>
            <p className="mt-1 font-medium">
              {recipe.bestDays.length > 0
                ? recipe.bestDays.join(", ")
                : "Any day"}
            </p>
          </div>
          <div>
            <p className="text-xs text-dim">Best hours</p>
            <p className="mt-1 font-medium">
              {recipe.bestHours.length > 0
                ? recipe.bestHours.map(hourLabel).join(", ")
                : "Any hour"}
            </p>
          </div>
          <div>
            <p className="text-xs text-dim">Media</p>
            <p className="mt-1 font-medium">
              {recipe.usesMedia ? "Media helps your posts" : "Text does fine"}
            </p>
          </div>
        </Card>
      </section>

      {hits.length > 0 && (
        <section className="mt-10">
          <SectionLabel>What worked</SectionLabel>
          <div className="mt-3 grid grid-cols-1 gap-3">
            {hits.slice(0, 6).map((p) => (
              <HitCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {misses.length > 0 && (
        <section className="mt-10">
          <SectionLabel>What died, and why</SectionLabel>
          <div className="mt-3 grid grid-cols-1 gap-3">
            {misses.slice(0, 8).map((p) => (
              <MissCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 flex justify-center">
        <Button onClick={onGenerate} className="px-6 py-3 text-base">
          Draft next week
        </Button>
      </div>
    </div>
  );
}
