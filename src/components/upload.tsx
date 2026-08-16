"use client";

import { useRef, useState } from "react";
import { Button, ErrorNote, Spinner } from "./ui";

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
      <h1 className="text-2xl font-semibold tracking-tight">
        Drop in your post history
      </h1>
      <p className="mt-2 text-dim">
        Export your posts as CSV from X analytics. It is free and takes a
        minute. Peak reads the text and the numbers.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) readFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center transition-colors ${
          dragOver ? "border-peak bg-peak/5" : "border-edge bg-panel"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file);
            e.target.value = "";
          }}
        />
        <span className="text-3xl">⛰️</span>
        <span className="font-medium">Drag your CSV here, or click to choose</span>
        <span className="text-sm text-dim">
          Works with the standard X analytics export
        </span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <Button
          variant="secondary"
          onClick={loadSample}
          disabled={sampleLoading || loading}
        >
          {sampleLoading ? <Spinner /> : null}
          Use sample export
        </Button>
      </div>

      <div className="mt-4">
        <ErrorNote message={error ?? ""} />
      </div>
    </div>
  );
}
