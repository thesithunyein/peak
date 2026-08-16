"use client";

import { useEffect, useState } from "react";
import type { Draft, Report } from "@/lib/types";
import { Nav, PeakBackground } from "@/components/ui";
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
    <div className="relative min-h-screen overflow-hidden text-ink">
      <PeakBackground />
      <Nav />
      <main className="relative z-10 mx-auto flex w-full max-w-[1180px] px-5 pb-8 sm:px-8">
        <div className="glass-shell flex min-h-[calc(100vh-108px)] w-full overflow-hidden rounded-[30px]">
          <div className="min-w-0 flex-1 px-5 py-8 sm:px-10 sm:py-10">
            {step === "import" && <UploadStep onCsv={analyze} loading={loading} error={error} />}
            {step === "report" && report && (
              <ReportStep report={report} onGenerate={() => setStep("generate")} onBack={() => setStep("import")} />
            )}
            {step === "generate" && report && (
              <GenerateStep report={report} onDone={(d) => { setDrafts(d); setStep("publish"); }} onBack={() => setStep("report")} />
            )}
            {step === "publish" && <PublishStep drafts={drafts} onBack={() => setStep("generate")} />}
          </div>
        </div>
      </main>
    </div>
  );
}
