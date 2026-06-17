import { NextRequest, NextResponse } from "next/server";
import { aiScamShield, ruleScamShield, type ShieldResult } from "@/lib/ai-scam-shield";

export async function POST(req: NextRequest) {
  let body: { text?: string; price?: number; area?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (text.length < 10) {
    return NextResponse.json({ error: "Paste a bit more of the listing or message to analyse." }, { status: 400 });
  }

  const input = {
    text,
    price: typeof body.price === "number" && body.price > 0 ? body.price : undefined,
    area: typeof body.area === "string" && body.area.trim() ? body.area.trim() : undefined,
  };

  const ai = await aiScamShield(input);
  const result: ShieldResult = ai ?? ruleScamShield(input);
  return NextResponse.json(result);
}
