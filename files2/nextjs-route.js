// Next.js App Router version — use this ONLY if your project is Next.js.
// Place at: app/api/generate/route.js   (delete the root-level api/ folder to avoid conflicts)

export async function GET() {
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);
  return Response.json({
    ok: true,
    hasKey,
    hint: hasKey
      ? "API route is reachable and the key is set."
      : "API route is reachable, but ANTHROPIC_API_KEY is NOT set. Add it in Vercel > Settings > Environment Variables, then Redeploy.",
  });
}

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not set on the server. Add it in Vercel env vars and redeploy." },
      { status: 500 }
    );
  }

  let body = {};
  try { body = await req.json(); } catch {}
  const word = (body?.word || "").trim();
  if (!word || word.length > 50) {
    return Response.json({ error: "Invalid word" }, { status: 400 });
  }

  const prompt = buildPrompt(word);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      let detail = errText.slice(0, 300);
      try { detail = JSON.parse(errText)?.error?.message || detail; } catch {}
      return Response.json({ error: `Anthropic API ${response.status}: ${detail}` }, { status: 502 });
    }

    const data = await response.json();
    const text = (data.content || []).map((b) => b.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const info = JSON.parse(clean);
    return Response.json(info);
  } catch (err) {
    console.error(err);
    return Response.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}

function buildPrompt(word) {
  return `You are helping a Chinese-speaking English learner build vocabulary flashcards.

The learner typed this word: "${word}"

STEP 1 — Validate. If it is not a correctly spelled real English word (a typo, gibberish, or not English), respond ONLY with:
{"valid": false, "suggestion": "<the most likely intended English word, or null if you cannot guess>"}

STEP 2 — If it is valid, respond ONLY with this JSON (no markdown fences, no extra text):
{
  "valid": true,
  "word": "<canonical lowercase form>",
  "pronunciation": "<IPA>",
  "partsOfSpeech": ["noun"],
  "collocations": ["4-6 natural word partners"],
  "coreConceptEn": "<one plain-English sentence capturing the core concept, not a dictionary definition>",
  "coreConceptZh": "<the core concept in natural Chinese, \u7b80\u4f53\u4e2d\u6587>",
  "examples": ["2-3 short example sentences showing the word in real context"],
  "synonyms": ["2-4 common synonyms"],
  "antonyms": ["0-3 common antonyms, [] if none"],
  "mnemonics": [
    {
      "method": "<\u65b9\u6cd5\u540d, one of: \u56fe\u50cf\u8054\u60f3\u6cd5 / \u8c10\u97f3\u8bb0\u5fc6\u6cd5 / \u8bcd\u6839\u8bcd\u7f00\u6cd5 / \u6545\u4e8b\u4e32\u8054\u6cd5 / \u8bcd\u6c47\u94fe\u6761\u6cd5>",
      "content": "<the mnemonic itself, written mainly in \u7b80\u4f53\u4e2d\u6587 with the English word(s) kept in English>"
    }
  ]
}

MNEMONIC RULES — pick the 1 or 2 methods that genuinely fit THIS word best (quality over quantity), from these five:
1. \u56fe\u50cf\u8054\u60f3\u6cd5: split the spelling into letter shapes and build one vivid mental picture (bake: b \u50cf\u70e4\u7bb1, a \u50cf\u82f9\u679c, k \u50cf\u5200\u53c9, e \u50cf\u76d8\u5b50).
2. \u8c10\u97f3\u8bb0\u5fc6\u6cd5: a Chinese phrase that sounds like the English word, tied to the meaning with a funny scene (ambulance \u2248 "\u4ffa\u4e0d\u80fd\u6b7b"). Only if the sound match is genuinely close.
3. \u8bcd\u6839\u8bcd\u7f00\u6cd5: prefix/root/suffix breakdown plus 1-2 sibling words (television = tele(\u8fdc) + vision(\u770b), \u540c\u6839 telephone).
4. \u6545\u4e8b\u4e32\u8054\u6cd5: weave the word with 2-3 simple words into one tiny fun story.
5. \u8bcd\u6c47\u94fe\u6761\u6cd5: letter-change chains to known words (light \u2192 night \u2192 fight \u2192 right).
Make it short, genuinely funny or vivid, and actually useful — not generic.`;
}
