"use client";

import { useState } from "react";
import type { Draft, Report } from "@/lib/types";
import { Button, Card, ErrorNote, SectionLabel, Spinner } from "./ui";

const COUNTS = [3, 5, 7, 10, 14];

export function GenerateStep({
  report,
  onDone,
  onBack,
}: {
  report: Report;
  onDone: (drafts: Draft[]) => void;
  onBack: () => void;
}) {
  const [count, setCount] = useState(7);
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, count, focus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Generation failed.");
      onDone(data.drafts as Draft[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Draft next week
          </h1>
          <p className="mt-1 text-dim">
            Posts written from your recipe, in your voice. Edit anything after.
          </p>
        </div>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      </div>

      <Card className="mt-6 p-5">
        <SectionLabel>How many posts</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                count === n
                  ? "border-peak bg-peak/10 text-peak"
                  : "border-edge bg-panel2 text-dim hover:text-ink"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <SectionLabel>Topic, optional</SectionLabel>
          <input
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. my new dev tool, or leave blank for a general week"
            className="mt-3 w-full rounded-lg border border-edge bg-panel2 px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-peak"
          />
        </div>
      </Card>

      <div className="mt-6 flex justify-center">
        <Button
          onClick={generate}
          disabled={loading}
          className="px-6 py-3 text-base"
        >
          {loading ? <Spinner /> : null}
          {loading ? "Writing drafts" : "Draft next week"}
        </Button>
      </div>

      <div className="mt-4">
        <ErrorNote message={error ?? ""} />
      </div>
    </div>
  );
}
