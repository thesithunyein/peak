"use client";

import { useEffect, useState } from "react";
import type { Draft, Report } from "@/lib/types";
import { Nav } from "@/components/ui";
import { UploadStep } from "@/components/upload";
import { ReportStep } from "@/components/report";
import { GenerateStep } from "@/components/generate";
import { PublishStep } from "@/components/publish";

type Step = "import" | "report" | "generate" | "publish";

export default function AppPage() {
  const [step, setStep] = useState<Step>("import");
  const [report, setReport] = useState<Report | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(csv: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Analysis failed.");
      setReport(data.report as Report);
      setDrafts([]);
      setStep("report");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Landing page "Load sample data" deep link.
    if (!window.location.search.includes("sample=1")) return;
    (async () => {
      setLoading(true);
      try {
        const csv = await (await fetch("/sample-export.csv")).text();
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csv }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Analysis failed.");
        setReport(data.report as Report);
        setStep("report");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Analysis failed.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {step === "import" && (
          <UploadStep onCsv={analyze} loading={loading} error={error} />
        )}
        {step === "report" && report && (
          <ReportStep
            report={report}
            onGenerate={() => setStep("generate")}
            onBack={() => setStep("import")}
          />
        )}
        {step === "generate" && report && (
          <GenerateStep
            report={report}
            onDone={(d) => {
              setDrafts(d);
              setStep("publish");
            }}
            onBack={() => setStep("report")}
          />
        )}
        {step === "publish" && (
          <PublishStep drafts={drafts} onBack={() => setStep("generate")} />
        )}
      </main>
    </div>
  );
}
