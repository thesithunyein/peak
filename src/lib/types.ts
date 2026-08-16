export type Verdict = "hit" | "miss" | "average";

export interface RawPost {
  id: string;
  text: string;
  createdAt: string; // ISO string, UTC
  impressions: number;
  engagements: number;
  likes: number;
  replies: number;
  reposts: number;
  urlClicks: number;
  profileClicks: number;
  mediaViews: number;
  videoViews: number;
}

export interface AnalyzedPost extends RawPost {
  engagementRate: number; // engagements / impressions * 100
  score: number; // engagementRate / medianRate
  verdict: Verdict;
  length: number; // char count
  hashtags: string[];
  mentions: number;
  hasMedia: boolean;
  hasLink: boolean;
  hasQuestion: boolean;
  hasNumber: boolean;
  opening: string; // first 20 words
  hour: number; // 0-23 UTC
  day: number; // 0-6, Sunday is 0
  why: string; // autopsy sentence for misses
}

export interface OpeningPattern {
  pattern: string;
  count: number;
}

export interface Recipe {
  topOpenings: OpeningPattern[];
  idealLength: { min: number; max: number; median: number };
  idealHashtagCount: number;
  bestDays: string[];
  bestHours: number[];
  usesMedia: boolean;
  voiceSamples: string[];
}

export interface Report {
  generatedAt: string;
  postCount: number;
  validCount: number;
  enoughData: boolean;
  hitCount: number;
  missCount: number;
  baseline: { medianRate: number; meanRate: number };
  hits: AnalyzedPost[];
  misses: AnalyzedPost[];
  recipe: Recipe;
}

export interface Draft {
  text: string;
  reason: string;
  day: string;
  hour: number;
}
