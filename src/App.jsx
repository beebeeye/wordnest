import { useState, useEffect, useCallback } from "react";

/* ---------- constants ---------- */

const DAY = 24 * 60 * 60 * 1000;
const OFFSETS = [1, 3, 7]; // days after first learning
const STORE_KEY = "vocab-words-v2";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');

:root {
  --blue: #4a7dde;
  --blue-deep: #2f5cb8;
  --blue-soft: #e8effc;
  --blue-mist: #f4f7fd;
  --ink: #1c2536;
  --muted: #67728a;
  --line: #dde5f2;
  --green: #2e9e6b;
  --amber: #b8860b;
  --card: #ffffff;
}
* { box-sizing: border-box; }
.app {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--blue-mist) 0%, #fbfcfe 60%);
  font-family: 'Manrope', system-ui, sans-serif;
  color: var(--ink);
  display: flex;
  justify-content: center;
  padding: 32px 20px 60px;
}
.shell { width: 100%; max-width: 520px; }

.brand { display: flex; align-items: baseline; gap: 10px; margin-bottom: 28px; }
.brand h1 {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 700; margin: 0; letter-spacing: -0.02em;
}
.brand span { color: var(--muted); font-size: 13px; font-weight: 500; }

.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 26px;
  box-shadow: 0 6px 24px rgba(74, 125, 222, 0.07);
}

.choice {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  gap: 14px; text-align: left;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 22px 24px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color .15s ease, transform .15s ease, box-shadow .15s ease;
  margin-bottom: 14px;
}
.choice:hover, .choice:focus-visible {
  border-color: var(--blue);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(74, 125, 222, 0.14);
  outline: none;
}
.choice h2 { margin: 0 0 4px; font-size: 18px; font-weight: 700; }
.choice p { margin: 0; font-size: 13.5px; color: var(--muted); line-height: 1.45; }
.badge {
  min-width: 34px; height: 34px; border-radius: 12px;
  background: var(--blue-soft); color: var(--blue-deep);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 14px; flex-shrink: 0; padding: 0 8px;
}
.badge.zero { background: #eef1f6; color: var(--muted); font-weight: 600; }

label { display: block; font-size: 13px; font-weight: 700; margin: 16px 0 6px; }
input {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 13px 15px;
  font-family: inherit;
  font-size: 17px;
  color: var(--ink);
  background: #fbfcff;
}
input:focus { outline: 2px solid var(--blue); outline-offset: 0; border-color: transparent; }

.btn {
  font-family: inherit;
  border: none; border-radius: 12px;
  padding: 13px 20px;
  font-size: 15px; font-weight: 700;
  cursor: pointer;
  transition: filter .15s ease, transform .1s ease;
}
.btn:active { transform: scale(0.98); }
.btn:focus-visible { outline: 2px solid var(--blue-deep); outline-offset: 2px; }
.btn:disabled { opacity: .55; cursor: default; }
.btn.primary { background: var(--blue); color: #fff; }
.btn.primary:hover:not(:disabled) { filter: brightness(1.06); }
.btn.ghost { background: transparent; color: var(--muted); }
.btn.ghost:hover { color: var(--ink); }
.btn.soft { background: var(--blue-soft); color: var(--blue-deep); }
.row { display: flex; gap: 10px; margin-top: 22px; }
.row .btn { flex: 1; }

.eyebrow {
  font-size: 11.5px; font-weight: 800; letter-spacing: 0.09em;
  text-transform: uppercase; color: var(--blue-deep); margin: 0 0 10px;
}
.word {
  font-family: 'Fraunces', serif;
  font-size: 34px; font-weight: 700; margin: 0; letter-spacing: -0.01em;
}
.phon { font-size: 15px; color: var(--muted); margin: 4px 0 0; }
.phon b { color: var(--blue-deep); font-weight: 700; margin-left: 8px; }

.sect { margin-top: 18px; }
.sect-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 800; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--muted); margin: 0 0 7px;
}
.sect-label .n {
  width: 18px; height: 18px; border-radius: 6px;
  background: var(--blue-soft); color: var(--blue-deep);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10.5px;
}
.sect p { margin: 0; font-size: 14.5px; line-height: 1.55; }
.zh { color: var(--muted); margin-top: 3px !important; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  background: var(--blue-mist); border: 1px solid var(--line);
  border-radius: 999px; padding: 4px 11px;
  font-size: 13px; font-weight: 600; color: var(--ink);
}
.chip.anti { background: #fdf6ec; border-color: #f0e2c8; color: var(--amber); }
.example {
  margin: 6px 0 0; padding: 10px 13px;
  background: var(--blue-mist);
  border-left: 3px solid var(--blue);
  border-radius: 0 10px 10px 0;
  font-size: 14px; color: var(--muted); font-style: italic; line-height: 1.5;
}
.fun {
  margin-top: 18px; padding: 14px 16px;
  background: linear-gradient(135deg, var(--blue-soft), #f2eefc);
  border-radius: 14px;
  font-size: 14px; line-height: 1.55;
}
.fun .sect-label { color: var(--blue-deep); margin-bottom: 5px; }
.fun + .fun { margin-top: 10px; }
.method-tag {
  background: #fff; border: 1px solid var(--line);
  border-radius: 999px; padding: 2px 10px;
  font-size: 11px; font-weight: 800; color: var(--blue-deep);
  letter-spacing: 0.02em; text-transform: none;
}

.trail { display: flex; align-items: center; gap: 6px; margin-top: 22px; }
.dot {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10.5px; font-weight: 800;
  background: #eef1f6; color: var(--muted);
  border: 1.5px solid transparent;
}
.dot.done { background: var(--blue); color: #fff; }
.dot.next { border-color: var(--blue); color: var(--blue-deep); background: var(--blue-soft); }
.dash { width: 14px; height: 2px; background: var(--line); border-radius: 2px; }
.trail-label { font-size: 12px; color: var(--muted); margin-left: 8px; font-weight: 600; }

.progress { font-size: 13px; color: var(--muted); font-weight: 600; margin-bottom: 14px; }
.center { text-align: center; }
.done-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--blue-soft); color: var(--blue-deep);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; margin: 0 auto 14px;
}
.note { font-size: 13px; color: var(--muted); line-height: 1.5; }
.toast {
  margin-top: 14px; padding: 11px 14px; border-radius: 12px;
  background: #e9f7f0; color: var(--green);
  font-size: 14px; font-weight: 700; line-height: 1.45;
}
.err { background: #fdeeee; color: #b04444; }
.spinner {
  width: 34px; height: 34px; border-radius: 50%;
  border: 3px solid var(--blue-soft); border-top-color: var(--blue);
  animation: spin .8s linear infinite; margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .choice, .btn { transition: none; }
  .spinner { animation-duration: 2s; }
}
`;

/* ---------- storage ---------- */

async function loadWords() {
  try {
    const res = await window.storage.get(STORE_KEY);
    return res ? JSON.parse(res.value) : [];
  } catch { return []; }
}
async function saveWords(words) {
  try { await window.storage.set(STORE_KEY, JSON.stringify(words)); return true; }
  catch { return false; }
}

/* ---------- AI word-card generation ---------- */

async function generateWordInfo(rawWord) {
  const prompt = `You are helping a Chinese-speaking English learner build vocabulary flashcards.

The learner typed this word: "${rawWord}"

STEP 1 — Validate. If it is not a correctly spelled real English word (a typo, gibberish, or not English), respond ONLY with:
{"valid": false, "suggestion": "<the most likely intended English word, or null if you cannot guess>"}

STEP 2 — If it is valid, respond ONLY with this JSON (no markdown fences, no extra text):
{
  "valid": true,
  "word": "<canonical lowercase form>",
  "pronunciation": "<IPA, e.g. /ˈsɛrənˌdɪpɪti/>",
  "partsOfSpeech": ["noun"],
  "collocations": ["4-6 natural word partners, e.g. 'pure serendipity'"],
  "coreConceptEn": "<one plain-English sentence capturing the core concept, not a dictionary definition>",
  "coreConceptZh": "<the core concept in natural Chinese, 简体中文>",
  "examples": ["2-3 short example sentences showing the word in real context"],
  "synonyms": ["2-4 common synonyms"],
  "antonyms": ["0-3 common antonyms, [] if none"],
  "mnemonics": [
    {
      "method": "<方法名, one of: 图像联想法 / 谐音记忆法 / 词根词缀法 / 故事串联法 / 词汇链条法>",
      "content": "<the mnemonic itself, written mainly in 简体中文 with the English word(s) kept in English>"
    }
  ]
}

MNEMONIC RULES — pick the 1 or 2 methods that genuinely fit THIS word best (quality over quantity), from these five:
1. 图像联想法: split the spelling into letter shapes and build one vivid, dynamic mental picture. Example — bake: b 像烤箱, a 像苹果, k 像刀叉, e 像盘子; 想象把苹果切好放进烤箱烘焙。
2. 谐音记忆法: find a Chinese phrase that sounds like the English pronunciation and tie it to the meaning with a funny scene. Example — ambulance ≈ "俺不能死" → 救护车; ponder ≈ "胖的" → 胖子吃太多坐下沉思。Only use if the sound match is genuinely close.
3. 词根词缀法: break the word into prefix/root/suffix and show how the pieces build the meaning, plus 1-2 sibling words sharing the same root. Example — television = tele(远) + vision(看), 同根还有 telephone。
4. 故事串联法: weave the word together with 2-3 simple related words into one tiny fun story. Example — "有一只 dog 在 sun 底下 run, 感觉非常 hot"。
5. 词汇链条法: change/add/remove a letter to chain it to words the learner likely knows. Example — light → night → fight → right, 一串一起记。
Make it short, genuinely funny or vivid, and actually useful for remembering — not generic.`;

  // 修改后的前端请求逻辑
const response = await fetch("/api/generate", {
  method: "POST",
  headers: { 
    "Content-Type": "application/json" 
  },
  body: JSON.stringify({ prompt: prompt }), // 将 prompt 发送给你自己的本地/云端后端
});

if (!response.ok) {
  const errData = await response.json();
  throw new Error(errData.error || 'Failed to generate word card');
}

const data = await response.json();
// 接下来保持你原本代码中对 data 的处理逻辑不变（比如 setCardData(data...) 等）
 
  const text = (data.content || []).map((b) => b.text || "").join("");
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

/* ---------- scheduling ---------- */

function isDue(w, now) { return w.stage >= 1 && w.stage <= 3 && w.nextReview <= now; }
function scheduleNext(w, now) {
  if (w.stage === 0) return { ...w, stage: 1, learnedAt: now, nextReview: now + OFFSETS[0] * DAY };
  const next = w.stage + 1;
  if (next > 3) return { ...w, stage: 4, nextReview: null };
  return { ...w, stage: next, nextReview: w.learnedAt + OFFSETS[next - 1] * DAY };
}
function pushBack(w, now) { return { ...w, nextReview: now + DAY }; }

/* ---------- shared pieces ---------- */

function Trail({ stage }) {
  const labels = ["1d", "3d", "7d"];
  return (
    <div className="trail" aria-label={`Review progress: stage ${Math.min(stage, 3)} of 3`}>
      {labels.map((l, i) => {
        const n = i + 1;
        let cls = "dot";
        if (stage > n || stage === 4) cls += " done";
        else if (stage === n) cls += " next";
        return (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className={cls}>{stage > n || stage === 4 ? "✓" : l}</span>
            {i < 2 && <span className="dash" />}
          </span>
        );
      })}
      <span className="trail-label">
        {stage === 0 ? "New word" : stage === 4 ? "Mastered" : `Next check: ${labels[stage - 1]} mark`}
      </span>
    </div>
  );
}

function WordInfo({ info }) {
  if (!info) return null;
  return (
    <div>
      <div className="sect">
        <p className="sect-label"><span className="n">2</span>Collocations · natural partners</p>
        <div className="chips">
          {(info.collocations || []).map((c, i) => <span className="chip" key={i}>{c}</span>)}
        </div>
      </div>

      <div className="sect">
        <p className="sect-label"><span className="n">3</span>Core concept</p>
        <p>{info.coreConceptEn}</p>
        <p className="zh">{info.coreConceptZh}</p>
      </div>

      <div className="sect">
        <p className="sect-label"><span className="n">4</span>In context</p>
        {(info.examples || []).map((e, i) => <p className="example" key={i}>"{e}"</p>)}
      </div>

      <div className="sect">
        <p className="sect-label"><span className="n">5</span>Synonyms &amp; antonyms</p>
        <div className="chips">
          {(info.synonyms || []).map((s, i) => <span className="chip" key={"s" + i}>≈ {s}</span>)}
          {(info.antonyms || []).map((a, i) => <span className="chip anti" key={"a" + i}>≠ {a}</span>)}
        </div>
      </div>

      {(() => {
        // supports both the new array format and older single-string cards
        const list = Array.isArray(info.mnemonics)
          ? info.mnemonics
          : info.mnemonic
            ? [{ method: null, content: info.mnemonic }]
            : [];
        if (list.length === 0) return null;
        return list.map((m, i) => (
          <div className="fun" key={i}>
            <p className="sect-label">
              <span className="n">6</span>
              趣味记忆{m.method ? <span className="method-tag">{m.method}</span> : null}
            </p>
            {m.content}
          </div>
        ));
      })()}
    </div>
  );
}

function WordHeader({ w }) {
  const info = w.info;
  return (
    <>
      <h2 className="word">{w.word}</h2>
      {info && (
        <p className="phon">
          <span className="sect-label" style={{ display: "inline-flex", marginRight: 8 }}><span className="n">1</span></span>
          {info.pronunciation}
          <b>{(info.partsOfSpeech || []).join(" · ")}</b>
        </p>
      )}
    </>
  );
}

/* ---------- screens ---------- */

function Home({ words, onGo }) {
  const now = Date.now();
  const newest = words.filter((w) => w.stage === 0).length;
  const due = words.filter((w) => isDue(w, now)).length;
  const mastered = words.filter((w) => w.stage === 4).length;
  const total = newest + due;

  return (
    <>
      <button className="choice" onClick={() => onGo("review")}>
        <div>
          <h2>Review</h2>
          <p>
            {total === 0
              ? "Nothing waiting right now — everything is on schedule."
              : `${newest} new ${newest === 1 ? "word" : "words"} to study, ${due} due for review.`}
          </p>
        </div>
        <span className={"badge" + (total === 0 ? " zero" : "")}>{total}</span>
      </button>

      <button className="choice" onClick={() => onGo("add")}>
        <div>
          <h2>Input a new word</h2>
          <p>Type a word — its full study card is built for you automatically.</p>
        </div>
        <span className="badge">＋</span>
      </button>

      <p className="note center" style={{ marginTop: 18 }}>
        {words.length} {words.length === 1 ? "word" : "words"} in your notebook · {mastered} mastered
      </p>
    </>
  );
}

function AddWord({ words, onSave, onBack, onReviewNow }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(null); // {err, msg}
  const [busy, setBusy] = useState(false);
  const [savedWord, setSavedWord] = useState(null); // just-created word → show now/later choice

  const submit = async () => {
    const raw = input.trim();
    if (!raw) { setStatus({ err: true, msg: "Please type a word first." }); return; }
    if (!/^[a-zA-Z][a-zA-Z\-' ]*$/.test(raw)) {
      setStatus({ err: true, msg: "That doesn't look like an English word. Please re-input using letters only." });
      return;
    }
    const dup = words.find((w) => w.word.toLowerCase() === raw.toLowerCase());
    if (dup) {
      setStatus({ err: true, msg: `"${dup.word}" is already in your notebook. Please re-input a different word.` });
      return;
    }

    setBusy(true);
    setStatus(null);
    try {
      const info = await generateWordInfo(raw);
      if (!info.valid) {
        setStatus({
          err: true,
          msg: info.suggestion
            ? `"${raw}" isn't recognized — did you mean "${info.suggestion}"? Please re-input.`
            : `"${raw}" isn't recognized as an English word. Please check the spelling and re-input.`,
        });
        setBusy(false);
        return;
      }
      const canonical = (info.word || raw).toLowerCase();
      const dup2 = words.find((w) => w.word.toLowerCase() === canonical);
      if (dup2) {
        setStatus({ err: true, msg: `"${canonical}" is already in your notebook. Please re-input a different word.` });
        setBusy(false);
        return;
      }
      const newWord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        word: canonical,
        info,
        createdAt: Date.now(),
        stage: 0,
        learnedAt: null,
        nextReview: null,
      };
      const ok = await onSave(newWord);
      if (!ok) {
        setStatus({ err: true, msg: "Couldn't save the word. Please try again." });
        setBusy(false);
        return;
      }
      setSavedWord(newWord);
      setInput("");
      setStatus(null);
    } catch {
      setStatus({ err: true, msg: "Couldn't build the word card — please check your connection and try again." });
    }
    setBusy(false);
  };

  // After a word is created: review now or later?
  if (savedWord) {
    return (
      <div className="card">
        <p className="eyebrow">Word card ready</p>
        <h2 className="word" style={{ fontSize: 28 }}>{savedWord.word}</h2>
        <p className="note" style={{ marginTop: 8 }}>
          Its full study card — pronunciation, collocations, core concept, examples, synonyms and a memory hook — has been created.
        </p>
        <div className="row">
          <button className="btn soft" onClick={() => setSavedWord(null)}>Later — input next word</button>
          <button className="btn primary" onClick={onReviewNow}>Review it now</button>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn ghost" onClick={onBack}>Back to start</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="eyebrow">New word</p>
      <label htmlFor="w">Type one English word</label>
      <input
        id="w"
        value={input}
        onChange={(e) => { setInput(e.target.value); setStatus(null); }}
        onKeyDown={(e) => { if (e.key === "Enter" && !busy) submit(); }}
        placeholder="e.g. serendipity"
        disabled={busy}
        autoFocus
      />
      {busy && (
        <div className="center" style={{ marginTop: 20 }}>
          <div className="spinner" />
          <p className="note">Building the study card — pronunciation, collocations, core concept, examples, synonyms and a memory hook…</p>
        </div>
      )}
      {status && <div className={"toast" + (status.err ? " err" : "")}>{status.msg}</div>}
      <div className="row">
        <button className="btn ghost" onClick={onBack} disabled={busy}>Back to start</button>
        <button className="btn primary" onClick={submit} disabled={busy}>
          {busy ? "Creating…" : "Create word card"}
        </button>
      </div>
    </div>
  );
}

function Review({ words, onUpdate, onBack }) {
  const now = Date.now();
  const fresh = words.filter((w) => w.stage === 0).sort((a, b) => b.createdAt - a.createdAt);
  const due = words.filter((w) => isDue(w, now)).sort((a, b) => a.nextReview - b.nextReview);
  const queue = [...fresh, ...due];

  const [revealed, setRevealed] = useState(false);
  const total = queue.length;

  if (total === 0) {
    return (
      <div className="card center">
        <div className="done-icon">✓</div>
        <p className="eyebrow" style={{ textAlign: "center" }}>All caught up</p>
        <p className="note">You've finished everything due today. Reviews unlock 1, 3, and 7 days after each word is first learned.</p>
        <div className="row">
          <button className="btn primary" onClick={onBack}>Back to start</button>
        </div>
      </div>
    );
  }

  const w = queue[0];
  const isNew = w.stage === 0;

  const answer = async (learned) => {
    const updated = learned ? scheduleNext(w, Date.now()) : pushBack(w, Date.now());
    setRevealed(false);
    await onUpdate(updated);
  };

  return (
    <div className="card">
      <p className="progress">{total} {total === 1 ? "card" : "cards"} left in this session</p>
      <p className="eyebrow">{isNew ? "Newest word — study it" : "Time to review"}</p>

      {isNew || revealed ? (
        <>
          <WordHeader w={w} />
          <WordInfo info={w.info} />
        </>
      ) : (
        <>
          <h2 className="word">{w.word}</h2>
          <p className="note" style={{ marginTop: 12 }}>Try to recall the meaning, a collocation, and one example — then check yourself.</p>
        </>
      )}

      <Trail stage={w.stage} />

      <div className="row">
        {isNew ? (
          <>
            <button className="btn ghost" onClick={onBack}>Back to start</button>
            <button className="btn primary" onClick={() => answer(true)}>I've learned this word</button>
          </>
        ) : !revealed ? (
          <>
            <button className="btn ghost" onClick={onBack}>Back to start</button>
            <button className="btn soft" onClick={() => setRevealed(true)}>Show the card</button>
          </>
        ) : (
          <>
            <button className="btn soft" onClick={() => answer(false)}>Not yet — show me tomorrow</button>
            <button className="btn primary" onClick={() => answer(true)}>I remember it</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- app ---------- */

export default function WordNest() {
  const [screen, setScreen] = useState("home");
  const [words, setWords] = useState(null);

  useEffect(() => { loadWords().then(setWords); }, []);

  const persist = useCallback(async (next) => {
    setWords(next);
    return saveWords(next);
  }, []);

  const addWord = async (w) => persist([...(words || []), w]);
  const updateWord = async (w) => persist((words || []).map((x) => (x.id === w.id ? w : x)));

  return (
    <div className="app">
      <style>{css}</style>
      <div className="shell">
        <div className="brand">
          <h1>WordNest</h1>
          <span>1 · 3 · 7 day review</span>
        </div>

        {words === null ? (
          <div className="card center"><p className="note">Loading your words…</p></div>
        ) : screen === "home" ? (
          <Home words={words} onGo={setScreen} />
        ) : screen === "add" ? (
          <AddWord
            words={words}
            onSave={addWord}
            onBack={() => setScreen("home")}
            onReviewNow={() => setScreen("review")}
          />
        ) : (
          <Review words={words} onUpdate={updateWord} onBack={() => setScreen("home")} />
        )}
      </div>
    </div>
  );
}
