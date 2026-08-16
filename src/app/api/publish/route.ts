import { NextResponse } from "next/server";
import { publishToTelegram } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: unknown };
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }
    await publishToTelegram(text);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to publish." },
      { status: 500 }
    );
  }
}
