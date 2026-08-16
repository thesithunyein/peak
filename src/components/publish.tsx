"use client";

import { useState } from "react";
import type { Draft } from "@/lib/types";
import { Badge, Button, Card } from "./ui";

export function PublishStep({ drafts, onBack }: { drafts: Draft[]; onBack: () => void }) {
  const [copied, setCopied] = useState<number | null>(null);

  async function copy(text: string, i: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied((current) => (current === i ? null : current)), 1500);
    } catch {
      // Clipboard permissions can be denied by the browser; the draft remains visible.
    }
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(drafts.map((draft) => draft.text).join("\n\n"));
    } catch {
      // Clipboard permissions can be denied by the browser; individual copy remains available.
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a5ff0]">Step 04 · Publish</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Your next week</h1>
          <p className="mt-2 text-sm leading-6 text-dim sm:text-base">Your drafts are ready. Copy each one or copy the complete set.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack}>Back</Button>
          <Button variant="secondary" onClick={copyAll}>Copy all</Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3">
        {drafts.map((draft, index) => (
          <Card key={`${draft.text}-${index}`} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone="peak">
                {draft.day || "This week"}{draft.hour ? ` · ${draft.hour}:00` : ""}
              </Badge>
              <Button
                variant={copied === index ? "primary" : "secondary"}
                onClick={() => copy(draft.text, index)}
                className="px-3 py-2 text-xs"
              >
                {copied === index ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7">{draft.text}</p>
            {draft.reason && <p className="mt-3 border-t border-white/70 pt-3 text-xs font-medium leading-5 text-dim">Why it fits: {draft.reason}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
