import type { AnalyzedPost, RawPost, Report, Verdict } from "./types";
import { computeDerived, mean, median, percentile, round2 } from "./metrics";
import { buildRecipe } from "./recipe";
import { buildAutopsy } from "./autopsy";

const MIN_SAMPLE = 10;

export function analyze(rows: RawPost[]): Report {
  const derived = rows.map(computeDerived);
  const valid = derived.filter((p) => p.text.length > 0 && p.impressions > 0);
  const enoughData = valid.length >= MIN_SAMPLE;

  const rates = valid.map((p) => p.engagementRate).sort((a, b) => a - b);
  const medianRate = median(rates);
  const p25 = percentile(rates, 0.25);
  const p75 = percentile(rates, 0.75);

  const scored: AnalyzedPost[] = valid.map((p) => {
    const score = medianRate > 0 ? p.engagementRate / medianRate : 1;
    const verdict: Verdict = !enoughData
      ? "average"
      : p.engagementRate >= p75
        ? "hit"
        : p.engagementRate <= p25
          ? "miss"
          : "average";
    return { ...p, score: round2(score), verdict, why: "" };
  });

  const hits = scored.filter((p) => p.verdict === "hit");
  const misses = scored.filter((p) => p.verdict === "miss");

  // Build the recipe from hits when possible, otherwise from the whole set
  // so the report is still useful on small samples.
  const recipe = buildRecipe(hits.length > 0 ? hits : scored);

  const missesWithWhy: AnalyzedPost[] = misses.map((p) => ({
    ...p,
    why: buildAutopsy(p, recipe, medianRate),
  }));

  hits.sort((a, b) => b.score - a.score);
  missesWithWhy.sort((a, b) => a.score - b.score);

  return {
    generatedAt: new Date().toISOString(),
    postCount: rows.length,
    validCount: valid.length,
    enoughData,
    hitCount: hits.length,
    missCount: missesWithWhy.length,
    baseline: { medianRate: round2(medianRate), meanRate: round2(mean(rates)) },
    hits,
    misses: missesWithWhy,
    recipe,
  };
}
