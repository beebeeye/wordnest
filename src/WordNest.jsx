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
.audio-btn {
  margin-left: 10px; border: 1px solid var(--line); background: var(--blue-mist);
  border-radius: 999px; padding: 3px 10px; font-size: 13px; cursor: pointer;
}
.audio-btn:hover { border-color: var(--blue); }

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

/* ---------- storage (browser localStorage) ---------- */

async function loadWords() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
async function saveWords(words) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(words)); return true; }
  catch { return false; }
}

/* ---------- word-card generation (free public APIs, no key needed) ----------
   - Free Dictionary API (dictionaryapi.dev): pronunciation, POS, definitions, examples, syn/ant
   - Datamuse (datamuse.com): collocations, spelling suggestions, word chains, syn/ant fallback
   - MyMemory (mymemory.translated.net): free EN->ZH translation for the core concept
   All are keyless and CORS-enabled, so everything runs in the browser. */

const PREFIXES = [
  ["tele", "远", "telephone, television"],
  ["trans", "穿过、转换", "transport, translate"],
  ["inter", "在…之间", "international, internet"],
  ["super", "超级", "superman, supermarket"],
  ["under", "在…下面、不足", "underground, underestimate"],
  ["micro", "微小", "microscope, microwave"],
  ["multi", "多", "multimedia, multiply"],
  ["auto", "自动、自己", "automatic, autobiography"],
  ["anti", "反对", "antivirus, antibody"],
  ["over", "过度、在上", "overwork, overcome"],
  ["semi", "半", "semicircle, semifinal"],
  ["post", "在…之后", "postpone, postwar"],
  ["pre", "在…之前", "preview, predict"],
  ["dis", "不、相反", "dislike, disagree"],
  ["mis", "错误地", "mistake, misunderstand"],
  ["non", "非、不", "nonsense, nonstop"],
  ["sub", "在…下面、次级", "subway, submarine"],
  ["uni", "单一", "uniform, unique"],
  ["un", "不、相反", "unhappy, unlucky"],
  ["re", "再次、回", "return, review"],
  ["ex", "向外、前任", "exit, export"],
  ["bi", "二、双", "bicycle, bilingual"],
  ["co", "共同", "cooperate, coworker"],
  ["de", "向下、去除", "decrease, defrost"],
  ["in", "不 / 向内", "invisible, include"],
  ["im", "不 / 向内", "impossible, import"],
];
const SUFFIXES = [
  ["ology", "…学科", "biology, psychology"],
  ["phobia", "…恐惧症", "hydrophobia"],
  ["ment", "名词后缀(行为/结果)", "movement, development"],
  ["ness", "名词后缀(性质)", "happiness, kindness"],
  ["tion", "名词后缀(动作/状态)", "action, education"],
  ["sion", "名词后缀(动作/状态)", "decision, discussion"],
  ["able", "能…的", "readable, comfortable"],
  ["ible", "能…的", "visible, possible"],
  ["ful", "充满…的", "beautiful, careful"],
  ["less", "没有…的", "careless, homeless"],
  ["ish", "有点…的 / 像…的", "childish, reddish"],
  ["ist", "…的人(专家)", "artist, scientist"],
  ["er", "…的人/物", "teacher, worker"],
  ["or", "…的人/物", "actor, visitor"],
  ["ly", "副词后缀", "quickly, happily"],
];
const LETTER_IMAGES = {
  a: "苹果", b: "烤箱", c: "月牙", d: "半块西瓜", e: "盘子", f: "小旗杆",
  g: "眼镜", h: "椅子", i: "蜡烛", j: "鱼钩", k: "刀叉", l: "筷子",
  m: "两座山峰", n: "小门洞", o: "鸡蛋", p: "气球", q: "拖着线的气球", r: "发芽的小草",
  s: "小蛇", t: "雨伞", u: "杯子", v: "胜利手势", w: "波浪", x: "剪刀",
  y: "弹弓", z: "闪电",
};

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function buildAffixMnemonic(word) {
  for (const [p, zh, eg] of PREFIXES) {
    if (word.startsWith(p) && word.length - p.length >= 3) {
      return {
        method: "词根词缀法",
        content: `${p}(${zh}) + ${word.slice(p.length)} → ${word}。同前缀的词还有：${eg}，认识一个前缀，记住一串单词！`,
      };
    }
  }
  for (const [s, zh, eg] of SUFFIXES) {
    if (word.endsWith(s) && word.length - s.length >= 3) {
      return {
        method: "词根词缀法",
        content: `${word.slice(0, word.length - s.length)} + ${s}(${zh}) → ${word}。同后缀的词还有：${eg}。`,
      };
    }
  }
  return null;
}

async function buildChainMnemonic(word) {
  if (word.length < 3 || word.includes(" ")) return null;
  try {
    // words spelled the same except the first letter, sorted by frequency
    const list = await fetchJson(
      `https://api.datamuse.com/words?sp=${encodeURIComponent("?" + word.slice(1))}&md=f&max=12`
    );
    const freq = (w) => {
      const t = (w.tags || []).find((x) => x.startsWith("f:"));
      return t ? parseFloat(t.slice(2)) : 0;
    };
    const chain = list
      .filter((w) => w.word !== word && /^[a-z]+$/.test(w.word) && freq(w) > 1)
      .sort((a, b) => freq(b) - freq(a))
      .slice(0, 3)
      .map((w) => w.word);
    if (chain.length < 2) return null;
    return {
      method: "词汇链条法",
      content: `${word} → ${chain.join(" → ")}，只换第一个字母就是一串新单词，放在一起记，温故又知新！`,
    };
  } catch { return null; }
}

function buildImageMnemonic(word) {
  if (word.length < 3 || word.length > 6 || !/^[a-z]+$/.test(word)) return null;
  const parts = [...word].map((ch) => `${ch} 像${LETTER_IMAGES[ch] || "一个符号"}`);
  return {
    method: "图像联想法",
    content: `把字母拆开看：${parts.join("、")}。把这些画面串成一个动态小场景，看到 ${word} 就能"看"出意思！`,
  };
}

async function translateZh(text) {
  try {
    const data = await fetchJson(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 450))}&langpair=en|zh-CN`
    );
    const t = data?.responseData?.translatedText || "";
    // MyMemory sometimes echoes the input or returns warnings in caps
    if (!t || t.toUpperCase() === text.toUpperCase() || /MYMEMORY WARNING/i.test(t)) return "";
    return t;
  } catch { return ""; }
}

async function generateWordInfo(rawWord) {
  const word = rawWord.toLowerCase().trim();

  // ---- 1. Look the word up (also serves as spelling validation) ----
  const dictRes = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
  );
  if (dictRes.status === 404) {
    let suggestion = null;
    try {
      const s = await fetchJson(`https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&max=1`);
      if (s[0] && s[0].word !== word) suggestion = s[0].word;
    } catch {}
    return { valid: false, suggestion };
  }
  if (!dictRes.ok) throw new Error(`词典服务暂时不可用 (HTTP ${dictRes.status})，请稍后再试`);
  const entries = await dictRes.json();
  const entry = entries[0] || {};

  const pronunciation =
    entry.phonetic || (entry.phonetics || []).find((p) => p.text)?.text || "";
  const audio = (entry.phonetics || []).find((p) => p.audio)?.audio || null;
  const meanings = entry.meanings || [];
  const partsOfSpeech = [...new Set(meanings.map((m) => m.partOfSpeech).filter(Boolean))];
  const defs = meanings.flatMap((m) => m.definitions || []);
  const coreConceptEn = defs[0]?.definition || "";
  const examples = defs.map((d) => d.example).filter(Boolean).slice(0, 3);
  let synonyms = [...new Set(meanings.flatMap((m) => m.synonyms || []))].slice(0, 4);
  let antonyms = [...new Set(meanings.flatMap((m) => m.antonyms || []))].slice(0, 3);

  // ---- 2. In parallel: translation, collocations, syn/ant fallback, word chain ----
  const [zh, before, after, synFallback, antFallback, chainM] = await Promise.all([
    translateZh(coreConceptEn || word),
    fetchJson(`https://api.datamuse.com/words?rel_bgb=${encodeURIComponent(word)}&max=4`).catch(() => []),
    fetchJson(`https://api.datamuse.com/words?rel_bga=${encodeURIComponent(word)}&max=4`).catch(() => []),
    synonyms.length ? Promise.resolve([]) :
      fetchJson(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=4`).catch(() => []),
    antonyms.length ? Promise.resolve([]) :
      fetchJson(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}&max=3`).catch(() => []),
    buildChainMnemonic(word),
  ]);

  if (!synonyms.length) synonyms = synFallback.map((w) => w.word).slice(0, 4);
  if (!antonyms.length) antonyms = antFallback.map((w) => w.word).slice(0, 3);

  const collocations = [
    ...before.filter((w) => /^[a-z]+$/.test(w.word)).map((w) => `${w.word} ${word}`),
    ...after.filter((w) => /^[a-z]+$/.test(w.word)).map((w) => `${word} ${w.word}`),
  ].slice(0, 6);

  // ---- 3. Mnemonics: prefer roots > chains > letter images, keep up to 2 ----
  const mnemonics = [buildAffixMnemonic(word), chainM, buildImageMnemonic(word)]
    .filter(Boolean)
    .slice(0, 2);

  return {
    valid: true,
    word,
    pronunciation,
    audio,
    partsOfSpeech,
    collocations,
    coreConceptEn,
    coreConceptZh: zh || "（在线翻译暂不可用）",
    examples,
    synonyms,
    antonyms,
    mnemonics,
  };
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
      {(info.collocations || []).length > 0 && (
        <div className="sect">
          <p className="sect-label"><span className="n">2</span>Collocations · natural partners</p>
          <div className="chips">
            {info.collocations.map((c, i) => <span className="chip" key={i}>{c}</span>)}
          </div>
        </div>
      )}

      <div className="sect">
        <p className="sect-label"><span className="n">3</span>Core concept</p>
        <p>{info.coreConceptEn}</p>
        <p className="zh">{info.coreConceptZh}</p>
      </div>

      {(info.examples || []).length > 0 && (
        <div className="sect">
          <p className="sect-label"><span className="n">4</span>In context</p>
          {info.examples.map((e, i) => <p className="example" key={i}>"{e}"</p>)}
        </div>
      )}

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
          {info.audio && (
            <button
              className="audio-btn"
              title="播放发音"
              onClick={() => { try { new Audio(info.audio).play(); } catch {} }}
            >
              🔊
            </button>
          )}
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
    } catch (e) {
      setStatus({ err: true, msg: `无法创建单词卡：${e.message || "请检查网络后重试"}` });
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
          <p className="note">正在从免费词典查询发音、搭配、释义、例句、同反义词，并生成记忆方法…</p>
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
