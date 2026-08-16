import type { RawPost } from "./types";

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = (sortedAsc.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedAsc[lo];
  return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (idx - lo);
}

export function tally(values: number[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
  return map;
}

export function mode(values: number[]): number {
  const counts = tally(values);
  let best = 0;
  let bestCount = -1;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}

export function hourLabel(h: number): string {
  const n = h % 24;
  if (n === 0) return "12am";
  if (n === 12) return "12pm";
  return n < 12 ? `${n}am` : `${n - 12}pm`;
}

const QUESTION_START =
  /^[\s("']*(what|why|how|when|who|which|where|is|are|was|were|do|does|did|can|could|should|would|will|have|has|your|you)\b/i;

function openingWords(text: string, count: number): string[] {
  return text.trim().split(/\s+/).slice(0, count);
}

export function dayHour(iso: string): { hour: number; day: number } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { hour: 9, day: 1 };
  return { hour: d.getUTCHours(), day: d.getUTCDay() };
}

export interface DerivedPost extends RawPost {
  engagementRate: number;
  length: number;
  hashtags: string[];
  mentions: number;
  hasMedia: boolean;
  hasLink: boolean;
  hasQuestion: boolean;
  hasNumber: boolean;
  opening: string;
  hour: number;
  day: number;
}

export function computeDerived(p: RawPost): DerivedPost {
  const text = p.text;
  const rate = p.impressions > 0 ? (p.engagements / p.impressions) * 100 : 0;
  const hashtags = [...text.matchAll(/(?:^|\s)#([\p{L}\p{N}_]+)/gu)].map(
    (m) => m[1]
  );
  const mentions = (text.match(/(?:^|\s)@[\p{L}\p{N}_]+/gu) ?? []).length;
  const opening = openingWords(text, 20).join(" ");
  const { hour, day } = dayHour(p.createdAt);

  return {
    ...p,
    engagementRate: rate,
    length: text.length,
    hashtags,
    mentions,
    hasMedia: p.mediaViews > 0 || p.videoViews > 0,
    hasLink: /https?:\/\//i.test(text) || p.urlClicks > 0,
    hasQuestion: /\?/.test(opening) || QUESTION_START.test(opening),
    hasNumber: /\d/.test(opening),
    opening,
    hour,
    day,
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
