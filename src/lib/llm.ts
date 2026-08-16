import type { Draft, Recipe } from "./types";

const BASE_URL = process.env.FEATHERLESS_BASE_URL ?? "https://api.featherless.ai/v1";
const DEFAULT_MODEL = "Qwen/Qwen2.5-72B-Instruct";

export function buildSystemPrompt(recipe: Recipe): string {
  const openings = recipe.topOpenings
    .map((o) => `${o.pattern} (${o.count})`)
    .join(", ");
  const samples = recipe.voiceSamples
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");
  const lengthLine =
    recipe.idealLength.max > 0
      ? `Length between ${recipe.idealLength.min} and ${recipe.idealLength.max} chars, median ${recipe.idealLength.median}.`
      : "Any length.";

  return [
    "You write social posts for a creator. You are given a recipe extracted from the creator's own best performing posts. Match the recipe exactly, do not pad, and keep the creator's voice from the samples.",
    "",
    `Recipe: open with one of these patterns: ${openings || "a plain statement"}. ${lengthLine} Use ${recipe.idealHashtagCount} hashtag${recipe.idealHashtagCount === 1 ? "" : "s"}. Best days: ${recipe.bestDays.join(", ") || "any"}. Best hours: ${recipe.bestHours.join(", ") || "any"}.`,
    "",
    "Voice samples from their winning posts:",
    samples || "(none provided)",
    "",
    'Return only JSON, no commentary and no markdown fences. Shape: {"drafts":[{"text":"...","reason":"...","day":"Monday","hour":9}]}. The reason is one short sentence naming which recipe rule the draft follows.',
  ].join("\n");
}

export function buildUserPrompt(count: number, focus?: string): string {
  const topic = focus && focus.trim() ? ` about: ${focus.trim()}` : "";
  return `Write ${count} posts for the creator's next week${topic}.`;
}

function parseDrafts(content: string, count: number): Draft[] {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  let obj: unknown;
  try {
    obj = JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) {
      throw new Error("Model did not return valid JSON.");
    }
    try {
      obj = JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      throw new Error("Model did not return valid JSON.");
    }
  }

  const arr = Array.isArray(obj)
    ? obj
    : (obj as { drafts?: unknown[] } | null)?.drafts;

  if (!Array.isArray(arr)) {
    throw new Error("Model response missing the drafts array.");
  }

  const drafts = arr
    .slice(0, count)
    .map((d) => {
      const item = d as {
        text?: unknown;
        reason?: unknown;
        day?: unknown;
        hour?: unknown;
      };
      return {
        text: String(item.text ?? "").trim(),
        reason: String(item.reason ?? "").trim(),
        day: String(item.day ?? "").trim(),
        hour: Number(item.hour) || 9,
      };
    })
    .filter((d) => d.text.length > 0);

  if (drafts.length === 0) throw new Error("Model returned no drafts.");
  return drafts;
}

export async function generateDrafts(
  recipe: Recipe,
  count: number,
  focus?: string
): Promise<Draft[]> {
  const apiKey = process.env.FEATHERLESS_API_KEY;
  if (!apiKey) {
    throw new Error("FEATHERLESS_API_KEY is not set on the server.");
  }
  const model = process.env.FEATHERLESS_MODEL ?? DEFAULT_MODEL;

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildSystemPrompt(recipe) },
        { role: "user", content: buildUserPrompt(count, focus) },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Featherless returned ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  return parseDrafts(content, count);
}
