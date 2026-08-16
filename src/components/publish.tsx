"use client";

import { useState } from "react";
import type { Draft } from "@/lib/types";
import { Badge, Button, Card } from "./ui";

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function PublishStep({ drafts: initialDrafts, onBack }: { drafts: Draft[]; onBack: () => void }) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [copied, setCopied] = useState<number | null>(null);

  async function copy(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(index);
      setTimeout(() => setCopied((current) => (current === index ? null : current)), 1500);
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

  function downloadTxt() {
    const content = drafts
      .map((draft, index) => `${index + 1}. ${draft.day || "This week"}${draft.hour ? ` at ${draft.hour}:00` : ""}\n${draft.text}`)
      .join("\n\n");
    downloadFile("peak-drafts.txt", content, "text/plain;charset=utf-8");
  }

  function downloadCsv() {
    const header = ["draft", "day", "hour", "text", "reason"].map(csvCell).join(",");
    const rows = drafts.map((draft, index) => [index + 1, draft.day, draft.hour, draft.text, draft.reason].map(csvCell).join(","));
    downloadFile("peak-drafts.csv", [header, ...rows].join("\n"), "text/csv;charset=utf-8");
  }

  function updateDraft(index: number, text: string) {
    setDrafts((current) => current.map((draft, draftIndex) => draftIndex === index ? { ...draft, text } : draft));
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a5ff0]">Step 04 · Publish</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Your next week</h1>
          <p className="mt-2 text-sm leading-6 text-dim sm:text-base">Edit anything, then copy your drafts or download the set.</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onBack}>Back</Button>
          <Button variant="secondary" onClick={copyAll}>Copy all</Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={downloadTxt} className="px-3 py-2 text-xs">Download TXT</Button>
        <Button variant="ghost" onClick={downloadCsv} className="px-3 py-2 text-xs">Download CSV</Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {drafts.map((draft, index) => (
          <Card key={`${index}-${draft.day}`} className="p-5">
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
            <label className="mt-4 block text-xs font-semibold text-dim" htmlFor={`draft-${index}`}>Edit draft</label>
            <textarea
              id={`draft-${index}`}
              value={draft.text}
              onChange={(event) => updateDraft(index, event.target.value)}
              rows={4}
              className="mt-2 w-full resize-y rounded-2xl border border-white/90 bg-white/65 px-4 py-3 text-[15px] leading-7 text-ink outline-none transition focus:border-[#5a5ff0] focus:ring-4 focus:ring-indigo-100"
            />
            {draft.reason && <p className="mt-3 border-t border-white/70 pt-3 text-xs font-medium leading-5 text-dim">Why it fits: {draft.reason}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
