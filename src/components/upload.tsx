"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Button, Card, ErrorNote, Spinner } from "./ui";

export function UploadStep({
  onCsv,
  loading,
  error,
}: {
  onCsv: (text: string, name: string) => void;
  loading: boolean;
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);

  async function loadSample() {
    setSampleLoading(true);
    try {
      const res = await fetch("/sample-export.csv");
      if (!res.ok) throw new Error("Sample file not found.");
      onCsv(await res.text(), "sample-export.csv");
    } catch {
      onCsv("", "");
    } finally {
      setSampleLoading(false);
    }
  }

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => onCsv(String(reader.result ?? ""), file.name);
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a5ff0]">Step 01 · Import</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Drop in your post history</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-dim sm:text-base">
            Export your posts as CSV from X analytics. Peak reads the text and the numbers, then gives you a pattern you can actually use.
          </p>
        </div>
        <span className="hidden h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-[#11121b] shadow-md sm:grid">
          <Image src="/logo.png" alt="Peak" width={42} height={42} className="logo-mark" />
        </span>
      </div>

      <Card
        className={`mt-8 flex cursor-pointer flex-col items-center justify-center gap-3 border-dashed px-6 py-16 text-center transition-all ${dragOver ? "border-[#5a5ff0] bg-indigo-50/70" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files?.[0]; if (file) readFile(file); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => { const file = e.target.files?.[0]; if (file) readFile(file); e.target.value = ""; }}
        />
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-2xl text-[#5a5ff0]">↥</span>
        <span className="font-semibold">Drag your CSV here, or click to choose</span>
        <span className="text-sm text-dim">Works with the standard X analytics export</span>
      </Card>

      <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button variant="secondary" onClick={loadSample} disabled={sampleLoading || loading}>
          {sampleLoading ? <Spinner /> : null}
          Explore sample data
        </Button>
        <span className="text-xs text-dim">No API key needed for import</span>
      </div>
      <div className="mt-5"><ErrorNote message={error ?? ""} /></div>
    </div>
  );
}
