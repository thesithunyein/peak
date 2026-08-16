import { NextResponse } from "next/server";
import { csvToPosts } from "@/lib/csv";
import { analyze } from "@/lib/postmortem";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { csv?: unknown };
    const text = typeof body?.csv === "string" ? body.csv : "";
    if (!text.trim()) {
      return NextResponse.json(
        { error: "No CSV text provided." },
        { status: 400 }
      );
    }

    const parsed = csvToPosts(text);
    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: parsed.errors.join(" ") },
        { status: 400 }
      );
    }

    const report = analyze(parsed.rows);
    return NextResponse.json({ report });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to analyze." },
      { status: 500 }
    );
  }
}
