"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "What do I upload?",
    answer: "Upload a CSV export of your own posts and metrics. Peak is built around the standard X analytics export, and the sample CSV shows the expected shape.",
  },
  {
    question: "What happens to my CSV?",
    answer: "Peak parses it in the app and sends only the submitted data to the analysis endpoint. Analysis is deterministic. Nothing is saved as a user account or database record.",
  },
  {
    question: "What does Peak find?",
    answer: "It compares engagement against your own baseline, separates hits from misses, explains likely causes for misses, and extracts a repeatable recipe from your winning posts.",
  },
  {
    question: "How are drafts created?",
    answer: "After analysis, Peak sends the recipe and winning examples to the configured Featherless model. The response is validated as drafts with a reason and suggested day and hour.",
  },
  {
    question: "Do I need an X API key?",
    answer: "No. The free CSV flow does not need an X developer account or payment. You can copy drafts, or optionally send them through Telegram if Telegram credentials are configured.",
  },
];

export function HowItWorks() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-white/85 bg-white/55 px-4 py-2 text-sm font-semibold text-dim shadow-sm transition hover:bg-white hover:text-ink"
      >
        New here? How it works
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#11121b]/60 px-5 py-8 backdrop-blur-md"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-it-works-title"
            className="relative z-10 max-h-[min(720px,90vh)] w-full max-w-2xl overflow-auto rounded-[28px] border border-white bg-[#f8f9ff] p-6 text-left text-[#171827] shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5a5ff0]">Peak guide</p>
                <h2 id="how-it-works-title" className="mt-2 text-3xl font-semibold tracking-[-0.04em]">How it works</h2>
                <p className="mt-2 text-sm leading-6 text-dim">A short guide from upload to your next week of posts.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close help" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e4e7f0] bg-white text-xl text-[#697083] transition hover:bg-[#eef0ff] hover:text-[#171827]">×</button>
            </div>

            <div className="mt-7 divide-y divide-[#e4e7f0] rounded-2xl border border-[#e4e7f0] bg-white px-4">
              {FAQS.map((faq, index) => {
                const isExpanded = expanded === index;
                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : index)}
                      aria-expanded={isExpanded}
                      className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-[#171827]"
                    >
                      {faq.question}
                      <span className="text-xl font-normal text-[#5a5ff0]">{isExpanded ? "−" : "+"}</span>
                    </button>
                    {isExpanded && <p className="-mt-1 pb-4 pr-8 text-sm leading-6 text-[#58627a]">{faq.answer}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
