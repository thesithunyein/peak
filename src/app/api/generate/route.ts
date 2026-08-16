import { NextResponse } from "next/server";
import { generateDrafts } from "@/lib/llm";
import type { Recipe } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      report?: { recipe?: Recipe };
      count?: unknown;
      focus?: unknown;
    };
    const recipe = body?.report?.recipe;
    if (!recipe) {
      return NextResponse.json({ error: "Recipe missing." }, { status: 400 });
    }

    const count = Math.min(Math.max(Number(body?.count) || 7, 1), 20);
    const focus = typeof body?.focus === "string" ? body.focus : undefined;
    const drafts = await generateDrafts(recipe, count, focus);
    return NextResponse.json({ drafts });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate." },
      { status: 500 }
    );
  }
}
