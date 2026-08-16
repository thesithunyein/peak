"use client";

import { useState } from "react";
import type { Draft } from "@/lib/types";
import { Badge, Button, Card, ErrorNote, Spinner } from "./ui";

export function PublishStep({
  drafts,
  onBack,
}: {
  drafts: Draft[];
  onBack: () => void;
}) {
  const [copied, setCopied] = useState<number | null>(null);
  const [sending, setSending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function copy(text: string, i: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
    } catch {
      // Clipboard can be blocked in some contexts; nothing to do.
    }
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(
        drafts.map((d) => d.text).join("\n\n")
      );
    } catch {
      // ignore
    }
  }

  async function sendToTelegram(text: string, i: number) {
    setSending(i);
    setError(null);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Send failed.");
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed.");
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your next week
          </h1>
          <p className="mt-1 text-dim">
            Copy each post, or send to Telegram when it is configured.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button variant="secondary" onClick={copyAll}>
            Copy all
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {drafts.map((d, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <Badge tone="peak">
                {d.day || "This week"}
                {d.hour ? ` · ${d.hour}:00` : ""}
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => sendToTelegram(d.text, i)}
                  disabled={sending === i}
                  className="px-3 py-1.5 text-xs"
                >
                  {sending === i ? <Spinner /> : null}
                  Send to Telegram
                </Button>
                <Button
                  variant={copied === i ? "primary" : "secondary"}
                  onClick={() => copy(d.text, i)}
                  className="px-3 py-1.5 text-xs"
                >
                  {copied === i ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">
              {d.text}
            </p>
            {d.reason && (
              <p className="mt-2 text-sm text-dim">Why: {d.reason}</p>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <ErrorNote message={error ?? ""} />
      </div>
    </div>
  );
}
