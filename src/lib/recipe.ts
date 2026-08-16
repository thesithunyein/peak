import type { AnalyzedPost, OpeningPattern, Recipe } from "./types";
import { DAY_NAMES, median, mode, tally } from "./metrics";

export function classifyOpening(opening: string): string {
  if (/\?/.test(opening)) return "Question";
  if (/^[\s("']*\d/.test(opening) && /\d/.test(opening)) return "Number-led";
  if (/^[\s("']*(how\s+to)\b/i.test(opening)) return "How-to";
  if (/\b(ways|tips|steps|things|lessons|mistakes|reasons)\b/i.test(opening))
    return "List";
  if (/\b(don'?t|stop|never|nobody|no one|unpopular|worst)\b/i.test(opening))
    return "Contrarian";
  if (/^[\s("']*(i|we|last|today|yesterday|this)\b/i.test(opening))
    return "Story";
  return "Statement";
}

function rankOpenings(hits: AnalyzedPost[]): OpeningPattern[] {
  const counts = new Map<string, number>();
  for (const h of hits) {
    const p = classifyOpening(h.opening);
    counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count);
}

function rankDays(hits: AnalyzedPost[]): string[] {
  const counts = tally(hits.map((h) => h.day));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([d]) => DAY_NAMES[d]);
}

function rankHours(hits: AnalyzedPost[]): number[] {
  const counts = tally(hits.map((h) => h.hour));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([h]) => h);
}

export function emptyRecipe(): Recipe {
  return {
    topOpenings: [],
    idealLength: { min: 0, max: 0, median: 0 },
    idealHashtagCount: 0,
    bestDays: [],
    bestHours: [],
    usesMedia: false,
    voiceSamples: [],
  };
}

export function buildRecipe(hits: AnalyzedPost[]): Recipe {
  if (hits.length === 0) return emptyRecipe();

  const lengths = hits.map((h) => h.length);
  const hashtagCounts = hits.map((h) => h.hashtags.length);
  const voice = [...hits]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((h) => h.text.slice(0, 260));

  return {
    topOpenings: rankOpenings(hits).slice(0, 3),
    idealLength: {
      min: Math.min(...lengths),
      max: Math.max(...lengths),
      median: Math.round(median(lengths)),
    },
    idealHashtagCount: mode(hashtagCounts),
    bestDays: rankDays(hits).slice(0, 2),
    bestHours: rankHours(hits).slice(0, 2),
    usesMedia: hits.filter((h) => h.hasMedia).length / hits.length >= 0.4,
    voiceSamples: voice,
  };
}
