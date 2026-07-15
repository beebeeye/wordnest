// Vercel serverless function: POST /api/generate  { word: "serendipity" }
// Keeps your Anthropic API key on the server (set ANTHROPIC_API_KEY in Vercel env vars).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set on the server" });
  }

  const word = (req.body?.word || "").trim();
  if (!word || word.length > 50) {
    return res.status(400).json({ error: "Invalid word" });
  }

  const prompt = `You are helping a Chinese-speaking English learner build vocabulary flashcards.

The learner typed this word: "${word}"

STEP 1 — Validate. If it is not a correctly spelled real English word (a typo, gibberish, or not English), respond ONLY with:
{"valid": false, "suggestion": "<the most likely intended English word, or null if you cannot guess>"}

STEP 2 — If it is valid, respond ONLY with this JSON (no markdown fences, no extra text):
{
  "valid": true,
  "word": "<canonical lowercase form>",
  "pronunciation": "<IPA, e.g. /\u02c8s\u025br\u0259n\u02ccd\u026ap\u026ati/>",
  "partsOfSpeech": ["noun"],
  "collocations": ["4-6 natural word partners, e.g. 'pure serendipity'"],
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
1. \u56fe\u50cf\u8054\u60f3\u6cd5: split the spelling into letter shapes and build one vivid, dynamic mental picture. Example — bake: b \u50cf\u70e4\u7bb1, a \u50cf\u82f9\u679c, k \u50cf\u5200\u53c9, e \u50cf\u76d8\u5b50; \u60f3\u8c61\u628a\u82f9\u679c\u5207\u597d\u653e\u8fdb\u70e4\u7bb1\u70d8\u7119\u3002
2. \u8c10\u97f3\u8bb0\u5fc6\u6cd5: find a Chinese phrase that sounds like the English pronunciation and tie it to the meaning with a funny scene. Example — ambulance \u2248 "\u4ffa\u4e0d\u80fd\u6b7b" \u2192 \u6551\u62a4\u8f66; ponder \u2248 "\u80d6\u7684" \u2192 \u80d6\u5b50\u5403\u592a\u591a\u5750\u4e0b\u6c89\u601d\u3002Only use if the sound match is genuinely close.
3. \u8bcd\u6839\u8bcd\u7f00\u6cd5: break the word into prefix/root/suffix and show how the pieces build the meaning, plus 1-2 sibling words sharing the same root. Example — television = tele(\u8fdc) + vision(\u770b), \u540c\u6839\u8fd8\u6709 telephone\u3002
4. \u6545\u4e8b\u4e32\u8054\u6cd5: weave the word together with 2-3 simple related words into one tiny fun story. Example — "\u6709\u4e00\u53ea dog \u5728 sun \u5e95\u4e0b run, \u611f\u89c9\u975e\u5e38 hot"\u3002
5. \u8bcd\u6c47\u94fe\u6761\u6cd5: change/add/remove a letter to chain it to words the learner likely knows. Example — light \u2192 night \u2192 fight \u2192 right, \u4e00\u4e32\u4e00\u8d77\u8bb0\u3002
Make it short, genuinely funny or vivid, and actually useful for remembering — not generic.`;

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
      return res.status(502).json({ error: "Upstream API error" });
    }

    const data = await response.json();
    const text = (data.content || []).map((b) => b.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const info = JSON.parse(clean);
    return res.status(200).json(info);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate word card" });
  }
}
