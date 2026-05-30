import { GoogleGenAI } from "@google/genai";

const key = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
console.log("key prefix:", key ? key.slice(0, 6) + "…" : "(none)", "| length:", key?.length, "| model:", model);

const ai = new GoogleGenAI({ apiKey: key });
try {
  const res = await ai.models.generateContent({
    model,
    contents: "Reply with exactly the word: OK",
    config: { temperature: 0 },
  });
  console.log("✅ Gemini works. Response:", JSON.stringify(res.text));
} catch (e) {
  console.log("❌ Gemini error:", e?.message || String(e));
}
