import type { RawPost } from "./types";

// Canonical header name -> the alias used in the X analytics export.
const HEADER_ALIASES: Record<string, string> = {
  "tweet id": "id",
  "tweet permalink": "permalink",
  "tweet text": "text",
  time: "createdAt",
  impressions: "impressions",
  engagements: "engagements",
  "engagement rate": "engagementRate",
  retweets: "reposts",
  replies: "replies",
  likes: "likes",
  "user profile clicks": "profileClicks",
  "url clicks": "urlClicks",
  "media views": "mediaViews",
  "media engagements": "mediaEngagements",
  "video views": "videoViews",
  "detail expands": "detailExpands",
};

const FRIENDLY: Record<string, string> = {
  text: "Tweet text",
  createdAt: "time",
  impressions: "impressions",
  engagements: "engagements",
};

const REQUIRED = ["text", "createdAt", "impressions", "engagements"] as const;

export interface CsvParseResult {
  rows: RawPost[];
  headers: string[];
  errors: string[];
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

function num(v: string): number {
  const n = parseFloat(v.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

// X exports "time" as something like "2026-08-13 14:22 +0000". UTC is assumed.
function parseXTime(v: string): Date {
  const t = v.trim();
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (m) {
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
  }
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

function idFromPermalink(permalink: string): string {
  const parts = permalink.split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : "";
}

/**
 * Minimal RFC4180 CSV parser. Handles quoted fields, escaped double quotes,
 * commas and newlines inside quotes, CRLF and CR line endings, and a UTF-8 BOM.
 */
export function parseCsvText(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // Ignore. CRLF is consumed by the following \n, a lone CR ends nothing.
    } else {
      field += c;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

export function csvToPosts(text: string): CsvParseResult {
  const rows = parseCsvText(text);
  if (rows.length < 2) {
    return { rows: [], headers: [], errors: ["No data rows found in the file."] };
  }

  const headerRow = rows[0];
  const canonicalToCol = new Map<string, number>();
  headerRow.forEach((h, i) => {
    const canon = HEADER_ALIASES[normalizeHeader(h)];
    if (canon && !canonicalToCol.has(canon)) canonicalToCol.set(canon, i);
  });

  const errors: string[] = [];
  for (const r of REQUIRED) {
    if (!canonicalToCol.has(r)) {
      errors.push(`Missing required column "${FRIENDLY[r]}".`);
    }
  }
  if (errors.length > 0) {
    return { rows: [], headers: headerRow, errors };
  }

  const posts: RawPost[] = [];
  for (let i = 1; i < rows.length; i++) {
    const data = rows[i];
    const pick = (canon: string): string => {
      const c = canonicalToCol.get(canon);
      return c === undefined ? "" : (data[c] ?? "");
    };
    const text = pick("text").trim();
    if (!text) continue;
    const permalink = pick("permalink").trim();
    posts.push({
      id: pick("id").trim() || idFromPermalink(permalink) || `row-${i}`,
      text,
      createdAt: parseXTime(pick("createdAt")).toISOString(),
      impressions: num(pick("impressions")),
      engagements: num(pick("engagements")),
      likes: num(pick("likes")),
      replies: num(pick("replies")),
      reposts: num(pick("reposts")),
      urlClicks: num(pick("urlClicks")),
      profileClicks: num(pick("profileClicks")),
      mediaViews: num(pick("mediaViews")),
      videoViews: num(pick("videoViews")),
    });
  }

  if (posts.length === 0) {
    errors.push("No posts found after the header row.");
    return { rows: [], headers: headerRow, errors };
  }

  return { rows: posts, headers: headerRow, errors };
}
