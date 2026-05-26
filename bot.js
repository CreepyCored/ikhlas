/**
 * ═══════════════════════════════════════════════════════════════
 *  HADITH SOURCE — sunnah.com primary, fawazahmed0 fallback
 *  All 9 collections fully mapped
 * ═══════════════════════════════════════════════════════════════
 *
 *  HOW TO INTEGRATE:
 *  1. Put this file next to your main bot file
 *  2. At the top of your main file add:
 *       const { fetchHadith, fetchRandomHadith } = require("./hadith_source");
 *  3. Delete these from your main file:
 *       fawazFetch(), parseHadith(), fetchHadith(), fetchRandomHadith()
 *  4. Update every call to pass COLLECTIONS + COL_KEYS:
 *       OLD:  fetchHadith(colKey, num)
 *       NEW:  fetchHadith(colKey, num, COLLECTIONS)
 *       OLD:  fetchRandomHadith(colKey)
 *       NEW:  fetchRandomHadith(colKey, COLLECTIONS, COL_KEYS)
 *  5. (Optional) Show source in footer — h.source will be
 *       "sunnah.com" or "fawaz (fallback)"
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────
//  SUNNAH.COM SLUGS  (verified from sunnah.com URLs)
//  Format: sunnah.com/{slug}:{number}
//  API:    sunnah.com/api/v2/hadiths/{slug}:{number}
// ─────────────────────────────────────────────────────
const SUNNAH_SLUGS = {
  bukhari:   "bukhari",    // sunnah.com/bukhari:1
  abudawud:  "abudawud",   // sunnah.com/abudawud:1
  tirmidhi:  "tirmidhi",   // sunnah.com/tirmidhi:1
  ibnmajah:  "ibnmajah",   // sunnah.com/ibnmajah:1
  nasai:     "nasai",      // sunnah.com/nasai:1
  malik:     "malik",      // sunnah.com/malik:1
  nawawi40:  "nawawi40",   // sunnah.com/nawawi40:1
  qudsi40:   "qudsi40",    // sunnah.com/qudsi40:1
  dehlawi40: "dehlawi40",  // sunnah.com/dehlawi40:1
};

// ─────────────────────────────────────────────────────
//  FAWAZ FALLBACK BASE URL
// ─────────────────────────────────────────────────────
const FAWAZ = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

// ─────────────────────────────────────────────────────
//  ALWAYS SAHIH COLLECTIONS
// ─────────────────────────────────────────────────────
const ALWAYS_SAHIH = new Set(["bukhari"]);

// ─────────────────────────────────────────────────────
//  GRADE NORMALIZER
// ─────────────────────────────────────────────────────
const GRADE_MAP = {
  "sahih": "Sahih", "authentic": "Sahih", "sound": "Sahih",
  "hasan": "Hasan", "good": "Hasan",
  "hasan sahih": "Hasan Sahih", "sahih hasan": "Hasan Sahih",
  "da'if": "Da'if", "daif": "Da'if", "da`eef": "Da'if", "weak": "Da'if",
  "maudu": "Maudu", "fabricated": "Maudu",
  "mursal": "Mursal", "mawquf": "Mawquf",
};
function normalGrade(raw) {
  if (!raw) return null;
  return GRADE_MAP[raw.trim().toLowerCase()] || raw.trim();
}

// ─────────────────────────────────────────────────────
//  HTML CLEANER
// ─────────────────────────────────────────────────────
function clean(s) {
  return (s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .trim();
}

// ─────────────────────────────────────────────────────
//  GRADE BUILDER  (shared by both parsers)
// ─────────────────────────────────────────────────────
function buildGrades(grades, colKey) {
  if (ALWAYS_SAHIH.has(colKey)) {
    return { finalGrade: "Sahih", allGrades: null };
  }
  if (!grades || !grades.length) {
    return { finalGrade: null, allGrades: null };
  }
  const primary = grades.find(g => /albani/i.test(g.name ?? "")) ?? grades[0];
  const finalGrade = normalGrade(primary.grade);
  const allGrades = grades
    .map(g => `${g.name}: ${g.grade}`)
    .join("\n");
  return { finalGrade, allGrades };
}

// ═══════════════════════════════════════════════════════════════
//  SUNNAH.COM  (primary source)
// ═══════════════════════════════════════════════════════════════
async function sunnahFetch(colKey, number) {
  const slug = SUNNAH_SLUGS[colKey];
  if (!slug) throw new Error(`No sunnah.com slug for: ${colKey}`);

  const url = `https://sunnah.com/api/v2/hadiths/${slug}:${number}`;
  const res = await fetch(url, {
    headers: {
      "Accept":     "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; IslamBot/2.0)",
      "Referer":    "https://sunnah.com/",
      "Origin":     "https://sunnah.com",
    },
  });

  if (!res.ok) throw new Error(`sunnah.com HTTP ${res.status}`);
  const json = await res.json();

  // sunnah.com v2 returns the hadith object directly or nested under .hadith
  const data = json.hadith ?? json;
  if (!data || (!data.englishBody && !data.body && !data.text)) {
    throw new Error("sunnah.com: empty or unrecognised response");
  }

  return parseSunnahHadith(data, colKey, number);
}

function parseSunnahHadith(data, colKey, number) {
  const english = clean(data.englishBody ?? data.body ?? data.text ?? "");
  const arabic  = clean(data.arabicBody  ?? data.arabic ?? "");
  const num     = String(data.hadithNumber ?? number);

  const { finalGrade, allGrades } = buildGrades(data.grades ?? [], colKey);

  const section = clean(
    data.chapter?.chapterEnglish ??
    data.chapterEnglish ??
    data.section ??
    ""
  ) || null;

  const ref = data.reference
    ? `Book ${data.reference.book}, Hadith ${data.reference.hadith}`
    : null;

  return { colKey, number: num, english, arabic, grade: finalGrade, allGrades, section, ref, source: "sunnah.com" };
}

// ═══════════════════════════════════════════════════════════════
//  FAWAZAHMED0  (fallback)
// ═══════════════════════════════════════════════════════════════
async function fawazFetch(edition, number) {
  const url = `${FAWAZ}/${edition}/${number}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fawaz HTTP ${res.status}`);
  return res.json();
}

function parseFawazHadith(engData, araData, colKey) {
  const h = engData.hadiths?.[0];
  const a = araData?.hadiths?.[0];
  if (!h) throw new Error(`fawaz: no hadiths in response for ${colKey}`);

  const english = clean(h.text ?? "");
  const arabic  = clean(a?.text ?? "");
  const number  = String(h.hadithnumber ?? h.arabicnumber ?? "?");

  const { finalGrade, allGrades } = buildGrades(h.grades ?? [], colKey);

  const sectionObj = engData.metadata?.section ?? {};
  const section    = Object.values(sectionObj)[0] ?? null;
  const ref = h.reference
    ? `Book ${h.reference.book}, Hadith ${h.reference.hadith}`
    : null;

  return { colKey, number, english, arabic, grade: finalGrade, allGrades, section, ref, source: "fawaz (fallback)" };
}

// ═══════════════════════════════════════════════════════════════
//  MAIN EXPORT — fetchHadith
//  Tries sunnah.com first, silently falls back to fawaz
// ═══════════════════════════════════════════════════════════════
async function fetchHadith(colKey, number, COLLECTIONS) {
  // ── 1. Try sunnah.com ──────────────────────────────────────
  try {
    const result = await sunnahFetch(colKey, number);
    console.log(`[hadith] ✓ sunnah.com  ${colKey}:${number}`);
    return result;
  } catch (err) {
    console.warn(`[hadith] sunnah.com failed (${colKey}:${number}) — ${err.message} — falling back to fawaz`);
  }

  // ── 2. Fallback: fawazahmed0 CDN ───────────────────────────
  const col = COLLECTIONS?.[colKey];
  if (!col) throw new Error(`Unknown collection key: ${colKey}`);

  const [eng, ara] = await Promise.allSettled([
    fawazFetch(col.fawaz_eng, number),
    fawazFetch(col.fawaz_ara, number),
  ]);

  if (eng.status === "rejected") throw eng.reason;

  const result = parseFawazHadith(
    eng.value,
    ara.status === "fulfilled" ? ara.value : null,
    colKey
  );
  console.log(`[hadith] ✓ fawaz fallback  ${colKey}:${number}`);
  return result;
}

// ═══════════════════════════════════════════════════════════════
//  MAIN EXPORT — fetchRandomHadith
// ═══════════════════════════════════════════════════════════════
async function fetchRandomHadith(colKey, COLLECTIONS, COL_KEYS) {
  const key = colKey ?? COL_KEYS[Math.floor(Math.random() * COL_KEYS.length)];
  const col = COLLECTIONS[key];
  if (!col) throw new Error(`Unknown collection key: ${key}`);
  const num = Math.floor(Math.random() * col.total) + 1;
  return fetchHadith(key, num, COLLECTIONS);
}

module.exports = { fetchHadith, fetchRandomHadith };
