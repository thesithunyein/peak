"use client";

import { useState } from "react";
import type { Draft } from "@/lib/types";
import { Badge, Button, Card, ErrorNote, Spinner } from "./ui";

export function PublishStep({ drafts, onBack }: { drafts: Draft[]; onBack: () => void }) {
  const [copied, setCopied] = useState<number | null>(null);
  const [sending, setSending] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function copy(text: string, i: number) { try { await navigator.clipboard.writeText(text); setCopied(i); setTimeout(() => setCopied((c) => c === i ? null : c), 1500); } catch {} }
  async function copyAll() { try { await navigator.clipboard.writeText(drafts.map((d) => d.text).join("\n\n")); } catch {} }
  async function sendToTelegram(text: string, i: number) {
    setSending(i); setError(null);
    try { const res = await fetch("/api/publish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) }); const data = await res.json(); if (!res.ok) throw new Error(data?.error ?? "Send failed."); setCopied(i); setTimeout(() => setCopied((c) => c === i ? null : c), 1500); }
    catch (e) { setError(e instanceof Error ? e.message : "Send failed."); } finally { setSending(null); }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a5ff0]">Step 04 · Publish</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Your next week</h1><p className="mt-2 text-sm leading-6 text-dim sm:text-base">Your drafts are ready. Copy each one, copy the set, or send to Telegram.</p></div><div className="flex gap-2"><Button variant="ghost" onClick={onBack}>Back</Button><Button variant="secondary" onClick={copyAll}>Copy all</Button></div></div>
      <div className="mt-8 grid grid-cols-1 gap-3">{drafts.map((d, i) => <Card key={i} className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><Badge tone="peak">{d.day || "This week"}{d.hour ? ` · ${d.hour}:00` : ""}</Badge><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => sendToTelegram(d.text, i)} disabled={sending === i} className="px-3 py-2 text-xs">{sending === i ? <Spinner /> : null}Send to Telegram</Button><Button variant={copied === i ? "primary" : "secondary"} onClick={() => copy(d.text, i)} className="px-3 py-2 text-xs">{copied === i ? "Copied" : "Copy"}</Button></div></div><p className="mt-4 whitespace-pre-wrap text-[15px] leading-7">{d.text}</p>{d.reason && <p className="mt-3 border-t border-white/70 pt-3 text-xs font-medium leading-5 text-dim">Why it fits: {d.reason}</p>}</Card>)}</div>
      <div className="mt-4"><ErrorNote message={error ?? ""} /></div>
    </div>
  );
}
