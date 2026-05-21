/**
 * ═══════════════════════════════════════════════════════════════
 *   ISLAMIC KNOWLEDGE BOT
 * ═══════════════════════════════════════════════════════════════
 *
 *  Hadith  — fawazahmed0 CDN  (cdn.jsdelivr.net)  NO KEY
 *  Quran   — AlQuran Cloud    (api.alquran.cloud)  NO KEY
 *  Tafsir / Duas / Asma / Hijri — UmmahAPI         NO KEY
 *
 *  ENV:  DISCORD_TOKEN  (required)
 *
 *  Changes:
 *  - Asma ul Husna: shows English translation/meaning prominently
 *  - Hadith: flexible name resolution (al-bukhari 1, sahih al-bukhari 1,
 *    bukhari 1, with/without diacritics, common aliases)
 *  - Auto-verse: shows page number, cleaner embed (no <> brackets)
 *  - Auto-verse embed improved styling overall
 *  - All emojis replaced with custom pixel server emojis
 * ═══════════════════════════════════════════════════════════════
 */

require("dotenv").config();
const {
  Client, GatewayIntentBits, EmbedBuilder,
  SlashCommandBuilder, REST, Routes,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// ─────────────────────────────────────────────────────
//  CUSTOM EMOJI REFERENCES
// ─────────────────────────────────────────────────────
const E = {
  incorrect_x:  "<:incorrect:1490332609102745600>",
  incorrect_o:  "<:incorrect:1490332611304755250>",
  key:          "<:key:1490332311965667469>",
  lock:         "<:lock:1490332316957016316>",
  screwdriver:  "<:screwdriver:1499021421328728204>",
  skull:        "<:skull:1502767276649222175>",
  speaker:      "<:speaker:1490332307113115768>",
  correct:      "<:correct:1490332296086163676>",
  copy:         "<:copy:1499021402672594954>",
  newspaper:    "<:newspaper:1490332321872740492>",
  paper:        "<:paper:1490332319221809313>",
  recycle:      "<:recycle:1490332293544411336>",
  hazard:       "<:hazard:1490332614845005906>",
  heart:        "<:heart:1503424887916593293>",
  brokenheart:  "<:brokenheart:1503424885534359744>",
  cloud:        "<:cloud:1490332376327389366>",
  brain:        "<:brain:1490332465250697256>",
  bell:         "<:bell:1490332309256274013>",
  horn:         "<:horn:1490332332463362078>",
  eye:          "<:eye:1490332470980378745>",
  leaf:         "<:leaf:1490332343918006402>",
  leaf2:        "<:2leaf:1490382769560485979>",
  logs:         "<:logs:1490332341711929545>",
  stick:        "<:stick:1490382783397498890>",
  rose:         "<:rose:1490332346459881522>",
  dice:         "<:dice:1505333329111683152>",
  book:         "<:book:1505332214051766384>",
  box:          "<:box:1505332088109400164>",
  earth:        "<:earth:1505332252953936154>",
  exclaim:      "<:exclamationmark:1505332358600196187>",
  folder:       "<:folder:1505332121982603275>",
  idea:         "<:idea:1505332431027310632>",
  letter:       "<:letter:1505332856925327459>",
  magnify:      "<:magnifyingglass:1505332144162209873>",
  internet:     "<:internet:1490332305196060723>",
  magnet:       "<:magnet:1505332668701872239>",
  link:         "<:link:1490332324762484940>",
  message:      "<:message:1505332064814370847>",
  pencil:       "<:pencil:1505332155482640495>",
  pin:          "<:pin:1505332838030114927>",
  questionmark: "<:questionmark:1505332395627249714>",
  sandclock:    "<:sandclock:1505332806258135150>",
  settings:     "<:settings:1505332485511319633>",
  stars:        "<:stars:1505332605426466937>",
  sun:          "<:sun:1505332915821613149>",
  trash:        "<:trash:1505332205369430126>",
  tree:         "<:tree:1505333276720631899>",
  waterdrop:    "<:waterdrop:1505332596681343198>",
  greenflag:    "<:greenflag:1505333142184136786>",
  yellowflag:   "<:yellowflag:1505333139965480971>",
  redflag:      "<:redflag:1505332395627249714>",
  blueflag:     "<:blueflag:1505333144528879616>",
  purpleflag:   "<:purpleflag:1505333146793541725>",
};

// ─────────────────────────────────────────────────────
//  API BASES
// ─────────────────────────────────────────────────────
const FAWAZ  = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
const QURAN  = "https://api.alquran.cloud/v1";
const UMMAH  = "https://ummahapi.com/api";

// ─────────────────────────────────────────────────────
//  COLLECTIONS
// ─────────────────────────────────────────────────────
const COLLECTIONS = {
  bukhari:  {
    name: "Sahih al-Bukhari", arabic: "صحيح البخاري",
    color: 0x1B5E20, emoji: E.newspaper, total: 7563,
    fawaz_eng: "eng-bukhari",  fawaz_ara: "ara-bukhari",
  },
  muslim:   {
    name: "Sahih Muslim", arabic: "صحيح مسلم",
    color: 0x0D47A1, emoji: E.newspaper, total: 7470,
    fawaz_eng: "eng-muslim",   fawaz_ara: "ara-muslim",
  },
  abudawud: {
    name: "Sunan Abu Dawud", arabic: "سنن أبي داود",
    color: 0x4A148C, emoji: E.newspaper, total: 5274,
    fawaz_eng: "eng-abudawud", fawaz_ara: "ara-abudawud",
  },
  tirmidhi: {
    name: "Jami at-Tirmidhi", arabic: "جامع الترمذي",
    color: 0x880E4F, emoji: E.newspaper, total: 3956,
    fawaz_eng: "eng-tirmidhi", fawaz_ara: "ara-tirmidhi",
  },
  ibnmajah: {
    name: "Sunan Ibn Majah", arabic: "سنن ابن ماجه",
    color: 0x004D40, emoji: E.newspaper, total: 4341,
    fawaz_eng: "eng-ibnmajah", fawaz_ara: "ara-ibnmajah",
  },
  nasai:    {
    name: "Sunan an-Nasa'i", arabic: "سنن النسائي",
    color: 0x37474F, emoji: E.newspaper, total: 5761,
    fawaz_eng: "eng-nasai",    fawaz_ara: "ara-nasai",
  },
  malik:    {
    name: "Muwatta Malik", arabic: "موطأ مالك",
    color: 0x6D4C41, emoji: E.newspaper, total: 1858,
    fawaz_eng: "eng-malik",    fawaz_ara: "ara-malik",
  },
  nawawi40: {
    name: "40 Hadith Nawawi", arabic: "الأربعون النووية",
    color: 0x00695C, emoji: E.tree, total: 42,
    fawaz_eng: "eng-nawawi40", fawaz_ara: "ara-nawawi40",
  },
  qudsi40:  {
    name: "40 Hadith Qudsi", arabic: "الأربعون القدسية",
    color: 0x1A237E, emoji: E.eye, total: 40,
    fawaz_eng: "eng-qudsi40",  fawaz_ara: "ara-qudsi40",
  },
  dehlawi40: {
    name: "40 Hadith Dehlawi", arabic: "أربعون الشاه ولي الله",
    color: 0x4E342E, emoji: E.paper, total: 40,
    fawaz_eng: "eng-dehlawi",  fawaz_ara: "ara-dehlawi1",
  },
};
const COL_KEYS = Object.keys(COLLECTIONS);
const ALWAYS_SAHIH = new Set(["bukhari", "muslim"]);

// ─────────────────────────────────────────────────────
//  COLLECTION NAME RESOLVER
// ─────────────────────────────────────────────────────
function stripDiacritics(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[''`']/g, "")
    .replace(/\u2019/g, "")
    .toLowerCase()
    .trim();
}

const COLLECTION_ALIASES = {
  bukhari: "bukhari", buhari: "bukhari",
  "al bukhari": "bukhari", "al-bukhari": "bukhari",
  "sahih bukhari": "bukhari", "sahih al bukhari": "bukhari",
  "sahih al-bukhari": "bukhari", "sahih albukhari": "bukhari",
  "صحيح البخاري": "bukhari",

  muslim: "muslim",
  "sahih muslim": "muslim", "al muslim": "muslim",
  "صحيح مسلم": "muslim",

  abudawud: "abudawud", "abu dawud": "abudawud", "abu dawood": "abudawud",
  abudawood: "abudawud", dawud: "abudawud", dawood: "abudawud",
  "sunan abu dawud": "abudawud", "sunan abudawud": "abudawud",
  "سنن ابي داود": "abudawud",

  tirmidhi: "tirmidhi", tirmizi: "tirmidhi", tirmizee: "tirmidhi",
  termizi: "tirmidhi", "al tirmidhi": "tirmidhi", "al-tirmidhi": "tirmidhi",
  "jami tirmidhi": "tirmidhi", "jami al tirmidhi": "tirmidhi",
  "jami at tirmidhi": "tirmidhi", "جامع الترمذي": "tirmidhi",

  ibnmajah: "ibnmajah", "ibn majah": "ibnmajah", "ibne majah": "ibnmajah",
  majah: "ibnmajah", "sunan ibn majah": "ibnmajah",
  "سنن ابن ماجه": "ibnmajah",

  nasai: "nasai", nasaai: "nasai", "al nasai": "nasai", "an nasai": "nasai",
  "an-nasai": "nasai", "al-nasai": "nasai", "nasa'i": "nasai",
  "sunan nasai": "nasai", "sunan an nasai": "nasai",
  "سنن النسائي": "nasai",

  malik: "malik", "muwatta": "malik", "muwatta malik": "malik",
  "imam malik": "malik", "موطأ مالك": "malik",

  nawawi: "nawawi40", nawawi40: "nawawi40", "40 nawawi": "nawawi40",
  "nawawi 40": "nawawi40", "forty nawawi": "nawawi40",
  "40 hadith nawawi": "nawawi40", "الاربعون النووية": "nawawi40",

  qudsi: "qudsi40", qudsi40: "qudsi40", "40 qudsi": "qudsi40",
  "qudsi 40": "qudsi40", "forty qudsi": "qudsi40",
  "hadith qudsi": "qudsi40", "40 hadith qudsi": "qudsi40",

  dehlawi: "dehlawi40", dehlawi40: "dehlawi40", "40 dehlawi": "dehlawi40",
  "dehlawi 40": "dehlawi40",
};

function resolveCollectionAndNumber(input) {
  if (!input) return null;
  const stripped = stripDiacritics(input);
  const aliases = Object.keys(COLLECTION_ALIASES).sort((a, b) => b.length - a.length);
  for (const alias of aliases) {
    const strippedAlias = stripDiacritics(alias);
    if (stripped.startsWith(strippedAlias)) {
      const rest = stripped.slice(strippedAlias.length).trim();
      const num  = parseInt(rest);
      if (!isNaN(num) && num >= 1) return { colKey: COLLECTION_ALIASES[alias], num };
    }
    if (stripped.endsWith(strippedAlias)) {
      const rest = stripped.slice(0, stripped.length - strippedAlias.length).trim();
      const num  = parseInt(rest);
      if (!isNaN(num) && num >= 1) return { colKey: COLLECTION_ALIASES[alias], num };
    }
  }
  return null;
}

function resolveCollectionKey(input) {
  if (!input) return null;
  const stripped = stripDiacritics(input);
  if (COL_KEYS.includes(stripped)) return stripped;
  const aliases = Object.keys(COLLECTION_ALIASES).sort((a, b) => b.length - a.length);
  for (const alias of aliases) {
    if (stripDiacritics(alias) === stripped) return COLLECTION_ALIASES[alias];
  }
  return null;
}

// ─────────────────────────────────────────────────────
//  QURAN TRANSLATIONS
// ─────────────────────────────────────────────────────
const TRANSLATIONS = {
  sahih_international: { name: "Saheeh International", flag: "🇬🇧", edition: "en.sahih"    },
  pickthall:           { name: "Pickthall",             flag: "🇬🇧", edition: "en.pickthall" },
  yusuf_ali:           { name: "Yusuf Ali",             flag: "🇬🇧", edition: "en.yusufali"  },
};
const TRANS_KEYS = Object.keys(TRANSLATIONS);
const DEFAULT_TR = "sahih_international";

// ─────────────────────────────────────────────────────
//  TAFSIR EDITIONS
// ─────────────────────────────────────────────────────
const TAFSIRS = {
  ibn_kathir:    { name: "Ibn Kathir (Abridged)", scholar: "Hafiz Ibn Kathir",                          lang: "English", flag: "🇬🇧" },
  maarif:        { name: "Ma'arif al-Qur'an",     scholar: "Mufti Muhammad Shafi",                      lang: "English", flag: "🇬🇧" },
  muyassar:      { name: "Tafsir Muyassar",       scholar: "Ministry of Islamic Affairs, Saudi Arabia", lang: "Arabic",  flag: "🇸🇦" },
  ibn_kathir_ar: { name: "Ibn Kathir (Arabic)",   scholar: "Hafiz Ibn Kathir",                          lang: "Arabic",  flag: "🇸🇦" },
};

// ─────────────────────────────────────────────────────
//  DUA CATEGORIES
// ─────────────────────────────────────────────────────
const DUAS = {
  morning:          { name: "Morning Adhkar",     emoji: E.sun,        count: 7 },
  evening:          { name: "Evening Adhkar",     emoji: E.sandclock,  count: 5 },
  prayer:           { name: "During Prayer",      emoji: E.paper,      count: 8 },
  after_prayer:     { name: "After Prayer",       emoji: E.bell,       count: 8 },
  sleep:            { name: "Sleep",              emoji: E.cloud,      count: 6 },
  food:             { name: "Food & Drink",       emoji: E.waterdrop,  count: 6 },
  travel:           { name: "Travel",             emoji: E.earth,      count: 6 },
  distress:         { name: "Distress & Anxiety", emoji: E.brokenheart,count: 7 },
  forgiveness:      { name: "Forgiveness",        emoji: E.heart,      count: 5 },
  illness:          { name: "Illness & Healing",  emoji: E.skull,      count: 5 },
  guidance:         { name: "Guidance",           emoji: E.idea,       count: 3 },
  protection:       { name: "Protection",         emoji: E.lock,       count: 4 },
  dhikr:            { name: "Dhikr",              emoji: E.recycle,    count: 6 },
  knowledge:        { name: "Knowledge",          emoji: E.brain,      count: 3 },
  gratitude:        { name: "Gratitude",          emoji: E.rose,       count: 3 },
  marriage:         { name: "Marriage & Family",  emoji: E.heart,      count: 4 },
  hajj:             { name: "Hajj & Umrah",       emoji: E.key,        count: 4 },
  grief:            { name: "Grief & Loss",       emoji: E.brokenheart,count: 4 },
  children:         { name: "Children",           emoji: E.heart,      count: 4 },
  night_prayer:     { name: "Night Prayer",       emoji: E.stars,      count: 4 },
  quran_recitation: { name: "Quran Recitation",   emoji: E.paper,      count: 3 },
};
const DUA_KEYS = Object.keys(DUAS);

// ─────────────────────────────────────────────────────
//  SURAH LOOKUP
// ─────────────────────────────────────────────────────
const SURAH_NAMES = [
  "Al-Fatihah","Al-Baqarah","Ali 'Imran","An-Nisa","Al-Ma'idah","Al-An'am","Al-A'raf","Al-Anfal","At-Tawbah","Yunus",
  "Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr","An-Nahl","Al-Isra","Al-Kahf","Maryam","Ta-Ha",
  "Al-Anbya","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Ash-Shu'ara","An-Naml","Al-Qasas","Al-Ankabut","Ar-Rum",
  "Luqman","As-Sajdah","Al-Ahzab","Saba","Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir",
  "Fussilat","Ash-Shuraa","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah","Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf",
  "Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'ah","Al-Hadid","Al-Mujadila","Al-Hashr","Al-Mumtahanah",
  "As-Saf","Al-Jumu'ah","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim","Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij",
  "Nuh","Al-Jinn","Al-Muzzammil","Al-Muddaththir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba","An-Nazi'at","Abasa",
  "At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq","Al-Buruj","At-Tariq","Al-A'la","Al-Ghashiyah","Al-Fajr","Al-Balad",
  "Ash-Shams","Al-Layl","Ad-Duha","Ash-Sharh","At-Tin","Al-Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-Adiyat",
  "Al-Qari'ah","At-Takathur","Al-Asr","Al-Humazah","Al-Fil","Quraysh","Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr",
  "Al-Masad","Al-Ikhlas","Al-Falaq","An-Nas",
];
const SURAH_ALIASES = {
  "fatiha":1,"fatihah":1,"opening":1,"baqara":2,"baqarah":2,"cow":2,"imran":3,"al imran":3,
  "nisa":4,"nisaa":4,"women":4,"maidah":5,"maida":5,"table":5,"anam":6,"cattle":6,
  "araf":7,"heights":7,"anfal":8,"spoils":8,"tawba":9,"tawbah":9,"repentance":9,
  "yunus":10,"hud":11,"yusuf":12,"rad":13,"thunder":13,"ibrahim":14,"hijr":15,
  "nahl":16,"bee":16,"isra":17,"night journey":17,"kahf":18,"cave":18,
  "maryam":19,"mary":19,"taha":20,"anbiya":21,"prophets":21,"hajj":22,"pilgrimage":22,
  "muminun":23,"nur":24,"light":24,"furqan":25,"shuara":26,"poets":26,
  "naml":27,"ant":27,"ants":27,"qasas":28,"stories":28,"ankabut":29,"spider":29,
  "rum":30,"romans":30,"luqman":31,"sajdah":32,"prostration":32,"ahzab":33,
  "saba":34,"fatir":35,"yasin":36,"ya sin":36,"ya-sin":36,"saffat":37,"sad":38,
  "zumar":39,"groups":39,"ghafir":40,"mumin":40,"fussilat":41,"shura":42,
  "zukhruf":43,"dukhan":44,"smoke":44,"jathiyah":45,"ahqaf":46,"muhammad":47,
  "fath":48,"victory":48,"hujurat":49,"qaf":50,"dhariyat":51,"tur":52,"mount":52,
  "najm":53,"star":53,"qamar":54,"moon":54,"rahman":55,"ar rahman":55,
  "waqiah":56,"hadid":57,"iron":57,"mujadila":58,"hashr":59,"mumtahanah":60,
  "saf":61,"jumuah":62,"friday":62,"munafiqun":63,"taghabun":64,"talaq":65,
  "divorce":65,"tahrim":66,"mulk":67,"dominion":67,"qalam":68,"pen":68,
  "haqqah":69,"maarij":70,"nuh":71,"noah":71,"jinn":72,"muzzammil":73,
  "muddaththir":74,"qiyamah":75,"resurrection":75,"insan":76,"human":76,
  "mursalat":77,"naba":78,"naziat":79,"abasa":80,"takwir":81,"infitar":82,
  "mutaffifin":83,"inshiqaq":84,"buruj":85,"tariq":86,"ala":87,"most high":87,
  "ghashiyah":88,"fajr":89,"dawn":89,"balad":90,"shams":91,"sun":91,
  "layl":92,"night":92,"duha":93,"sharh":94,"inshirah":94,"tin":95,"fig":95,
  "alaq":96,"clot":96,"iqra":96,"qadr":97,"power":97,"bayyinah":98,
  "zalzalah":99,"earthquake":99,"adiyat":100,"qariah":101,"takathur":102,
  "asr":103,"time":103,"humazah":104,"fil":105,"elephant":105,"quraysh":106,
  "maun":107,"kawthar":108,"abundance":108,"kafirun":109,"disbelievers":109,
  "nasr":110,"masad":111,"lahab":111,"ikhlas":112,"sincerity":112,"tawhid":112,
  "falaq":113,"nas":114,"mankind":114,
};
function resolveSurah(input) {
  if (!input) return null;
  const n = parseInt(input);
  if (!isNaN(n) && n >= 1 && n <= 114) return n;
  const lower = input.trim().toLowerCase()
    .replace(/^(al-|al |as-|as |an-|an |at-|at |az-|az |ad-|ad |ar-|ar |ash-|ash )/i, "").trim();
  if (SURAH_ALIASES[lower] != null) return SURAH_ALIASES[lower];
  if (SURAH_ALIASES[input.trim().toLowerCase()] != null) return SURAH_ALIASES[input.trim().toLowerCase()];
  const idx = SURAH_NAMES.findIndex(s =>
    s.toLowerCase() === input.trim().toLowerCase() ||
    s.toLowerCase().replace(/^(al-|as-|an-|at-|az-|ad-|ar-|ash-)/i,"").trim() === lower
  );
  return idx !== -1 ? idx + 1 : null;
}

// ─────────────────────────────────────────────────────
//  GRADE SYSTEM
// ─────────────────────────────────────────────────────
const GRADE_MAP = {
  "sahih":"Sahih","صحيح":"Sahih","authentic":"Sahih","sound":"Sahih",
  "hasan":"Hasan","حسن":"Hasan","good":"Hasan",
  "hasan sahih":"Hasan Sahih","sahih hasan":"Hasan Sahih",
  "da'if":"Da'if","daif":"Da'if","da`eef":"Da'if","weak":"Da'if","ضعيف":"Da'if",
  "maudu":"Maudu","fabricated":"Maudu","موضوع":"Maudu",
  "mursal":"Mursal","mawquf":"Mawquf",
};
const GRADE_META = {
  "Sahih":       { label: "Sahih — Authentic",    emoji: E.correct,     color: 0x1B5E20 },
  "Hasan":       { label: "Hasan — Good",          emoji: E.greenflag,   color: 0xF9A825 },
  "Hasan Sahih": { label: "Hasan Sahih",           emoji: E.correct,     color: 0x2E7D32 },
  "Da'if":       { label: "Da'if — Weak",          emoji: E.incorrect_x, color: 0xB71C1C },
  "Maudu":       { label: "Maudu — Fabricated",    emoji: E.skull,       color: 0x212121 },
  "Mursal":      { label: "Mursal — Disconnected", emoji: E.hazard,      color: 0xE65100 },
  "Mawquf":      { label: "Mawquf — Stopped",      emoji: E.purpleflag,  color: 0x6A1B9A },
};
function normalGrade(raw) {
  if (!raw) return null;
  return GRADE_MAP[raw.trim().toLowerCase()] || raw.trim();
}

// ─────────────────────────────────────────────────────
//  UTIL
// ─────────────────────────────────────────────────────
function clean(s) {
  return (s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&nbsp;/g," ").replace(/&#39;/g,"'").replace(/&quot;/g,'"')
    .trim();
}
function truncate(s, max = 3800) {
  if (!s) return "";
  return s.length > max ? s.substring(0, max) + "\n*(truncated…)*" : s;
}

// ─────────────────────────────────────────────────────
//  SAFE STRING EXTRACTOR — prevents [object Object]
// ─────────────────────────────────────────────────────
function safeStr(val) {
  if (typeof val === "string") return val;
  if (val === null || val === undefined) return "";
  if (typeof val === "number") return String(val);
  // If it's an object with a common text field, extract it
  if (typeof val === "object") {
    return val.text || val.value || val.name || val.arabic || val.english || "";
  }
  return "";
}

// Strip parenthetical notes like (verb), (noun), (3rd person) etc.
function stripParens(s) {
  return safeStr(s).replace(/\s*\([^)]*\)/g, "").trim();
}

// ═══════════════════════════════════════════════════════════════
//  FAWAZAHMED0 HADITH API
// ═══════════════════════════════════════════════════════════════
async function fawazFetch(edition, number) {
  const url = `${FAWAZ}/${edition}/${number}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fawaz HTTP ${res.status} — ${url}`);
  return res.json();
}

function parseHadith(engData, araData, colKey) {
  const h = engData.hadiths?.[0];
  const a = araData?.hadiths?.[0];
  if (!h) throw new Error(`fawaz returned no hadiths for ${colKey}`);

  const english = clean(h.text ?? "");
  const arabic  = clean(a?.text ?? "");
  const number  = String(h.hadithnumber ?? h.arabicnumber ?? "?");

  const grades = Array.isArray(h.grades) ? h.grades : [];
  let finalGrade, allGrades;

  if (ALWAYS_SAHIH.has(colKey)) {
    finalGrade = "Sahih";
    allGrades  = `${E.correct} **Sahih** *(Agreed Upon — Muttafaqun Alayh)*`;
  } else if (grades.length > 0) {
    const primary  = grades.find(g => /albani/i.test(g.name ?? "")) ?? grades[0];
    finalGrade     = normalGrade(primary.grade);
    allGrades = grades.map(g => {
      const norm  = normalGrade(g.grade);
      const emoji = GRADE_META[norm]?.emoji ?? E.incorrect_o;
      return `${emoji} **${g.name}**: ${g.grade}`;
    }).join("\n");
  } else {
    finalGrade = null;
    allGrades  = null;
  }

  const sectionObj = engData.metadata?.section ?? {};
  const section    = Object.values(sectionObj)[0] ?? null;
  const ref = h.reference
    ? `Book ${h.reference.book}, Hadith ${h.reference.hadith}`
    : null;

  return { colKey, number, english, arabic, grade: finalGrade, allGrades, section, ref };
}

async function fetchHadith(colKey, number) {
  const col = COLLECTIONS[colKey];
  const [eng, ara] = await Promise.allSettled([
    fawazFetch(col.fawaz_eng, number),
    fawazFetch(col.fawaz_ara, number),
  ]);
  if (eng.status === "rejected") throw eng.reason;
  return parseHadith(eng.value, ara.status === "fulfilled" ? ara.value : null, colKey);
}

async function fetchRandomHadith(colKey) {
  const key = colKey ?? COL_KEYS[Math.floor(Math.random() * COL_KEYS.length)];
  const col = COLLECTIONS[key];
  const num = Math.floor(Math.random() * col.total) + 1;
  return fetchHadith(key, num);
}

// ═══════════════════════════════════════════════════════════════
//  QURAN  (AlQuran Cloud)
// ═══════════════════════════════════════════════════════════════
async function fetchAyah(surahN, ayahN, trKey = DEFAULT_TR) {
  const ed  = TRANSLATIONS[trKey]?.edition ?? TRANSLATIONS[DEFAULT_TR].edition;
  const res = await fetch(`${QURAN}/ayah/${surahN}:${ayahN}/editions/quran-uthmani,${ed}`);
  if (!res.ok) throw new Error(`AlQuran HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlQuran: ${json.status}`);
  const ar = json.data.find(d => d.edition.identifier === "quran-uthmani");
  const tr = json.data.find(d => d.edition.identifier === ed);
  if (!ar || !tr) throw new Error("AlQuran bad response");
  return {
    surahName: ar.surah.englishName, surahArabic: ar.surah.name,
    surahNum: ar.surah.number, ayahNum: ar.numberInSurah,
    totalAyahs: ar.surah.numberOfAyahs,
    arabic: ar.text, translation: clean(tr.text),
    page: ar.page, juz: ar.juz,
  };
}

async function fetchRandomAyah(trKey = DEFAULT_TR) {
  const ed  = TRANSLATIONS[trKey]?.edition ?? TRANSLATIONS[DEFAULT_TR].edition;
  const res = await fetch(`${QURAN}/ayah/random/editions/quran-uthmani,${ed}`);
  if (!res.ok) throw new Error(`AlQuran HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlQuran: ${json.status}`);
  const ar = json.data.find(d => d.edition.identifier === "quran-uthmani");
  const tr = json.data.find(d => d.edition.identifier === ed);
  if (!ar || !tr) throw new Error("AlQuran bad response");
  return {
    surahName: ar.surah.englishName, surahArabic: ar.surah.name,
    surahNum: ar.surah.number, ayahNum: ar.numberInSurah,
    totalAyahs: ar.surah.numberOfAyahs,
    arabic: ar.text, translation: clean(tr.text),
    page: ar.page, juz: ar.juz,
  };
}

async function fetchSurah(surahN, trKey = DEFAULT_TR) {
  const ed = TRANSLATIONS[trKey]?.edition ?? TRANSLATIONS[DEFAULT_TR].edition;
  const [infoRes, firstRes] = await Promise.all([
    fetch(`${QURAN}/surah/${surahN}`),
    fetch(`${QURAN}/ayah/${surahN}:1/editions/quran-uthmani,${ed}`),
  ]);
  if (!infoRes.ok) throw new Error(`AlQuran surah HTTP ${infoRes.status}`);
  const info = (await infoRes.json()).data;
  let first = null;
  if (firstRes.ok) {
    const j = await firstRes.json();
    if (j.code === 200) {
      const ar = j.data.find(d => d.edition.identifier === "quran-uthmani");
      const tr = j.data.find(d => d.edition.identifier === ed);
      if (ar && tr) first = { arabic: ar.text, translation: clean(tr.text) };
    }
  }
  return {
    number: info.number, nameArabic: info.name, nameEnglish: info.englishName,
    meaning: info.englishNameTranslation, revelation: info.revelationType,
    totalAyahs: info.numberOfAyahs, first,
  };
}

// ═══════════════════════════════════════════════════════════════
//  UMMAHAPI  (Tafsir · Dua · Asma · Hijri)
// ═══════════════════════════════════════════════════════════════
async function ummahFetch(path) {
  const res  = await fetch(`${UMMAH}${path}`);
  if (!res.ok) throw new Error(`UmmahAPI HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error("UmmahAPI error");
  return json.data;
}
const getTafsir        = (k,s,a)     => ummahFetch(`/tafsir/${k}/surah/${s}/ayah/${a}`);
const getRandomDua     = ()          => ummahFetch("/duas/random");
const getDuasByCat     = c           => ummahFetch(`/duas/category/${c}`);
const getAllAsma        = ()          => ummahFetch("/asma-ul-husna");
const getHijri         = ()          => ummahFetch("/today-hijri");
const getDuaCategories = ()          => ummahFetch("/duas/categories");
const getRandomAsma    = ()          => ummahFetch("/asma-ul-husna/random");
const searchAsma       = q           => ummahFetch(`/asma-ul-husna/search?q=${encodeURIComponent(q)}`);
const getIslamicEvents = ()          => ummahFetch("/islamic-events");
const getQibla         = (lat,lng)   => ummahFetch(`/qibla?lat=${lat}&lng=${lng}`);
const getWordByWord    = (s,a)       => ummahFetch(`/quran/words/${s}/${a}`);

// ═══════════════════════════════════════════════════════════════
//  EMBED BUILDERS
// ═══════════════════════════════════════════════════════════════
function hadithEmbed(h, showArabic = false) {
  const col = COLLECTIONS[h.colKey];
  const g   = h.grade ? (GRADE_META[h.grade] || { label: h.grade, emoji: E.incorrect_o, color: null }) : null;

  const embed = new EmbedBuilder()
    .setColor(g?.color ?? col.color)
    .setTitle(`${col.name}  •  Hadith #${h.number}`)
    .setDescription(`*"${truncate(h.english || "Translation unavailable.", 3800)}"*`)
    .setFooter({ text: "fawazahmed0 CDN • لا علم إلا ما علَّم الله" })
    .setTimestamp();

  if (g) {
    embed.addFields({
      name:   `${E.stars} Grade`,
      value:  h.allGrades ? h.allGrades.substring(0, 1000) : `${g.emoji} **${g.label}**`,
      inline: false,
    });
  }

  embed.addFields(
    { name: `${E.book} Collection`, value: col.name,       inline: true },
    { name: `${E.pin} Number`,      value: `#${h.number}`, inline: true }
  );
  if (h.ref)     embed.addFields({ name: `${E.link} Reference`, value: h.ref,                    inline: true });
  if (h.section) embed.addFields({ name: `${E.folder} Chapter`,   value: truncate(h.section, 256), inline: false });
  if (showArabic && h.arabic) {
    embed.addFields({ name: `${E.letter} Arabic`, value: `\`\`\`${truncate(h.arabic, 1000)}\`\`\`` });
  }
  return embed;
}

function ayahEmbed(v, trKey = DEFAULT_TR) {
  const tr = TRANSLATIONS[trKey] ?? TRANSLATIONS[DEFAULT_TR];

  let desc = v.translation || "Translation unavailable.";
  if (v.arabic) desc += `\n\n> ${v.arabic}`;

  return new EmbedBuilder()
    .setColor(0x1B5E20)
    .setTitle(`${v.surahName} ${v.surahNum}:${v.ayahNum}  —  ${tr.name}`)
    .setDescription(desc)
    .addFields(
      { name: `${E.book} Surah`,        value: `${v.surahName} (${v.surahArabic})`, inline: true },
      { name: `${E.pin} Ayah`,          value: `${v.ayahNum} / ${v.totalAyahs}`,    inline: true },
      { name: `${E.newspaper} Page`,    value: v.page ? `${v.page} / 604` : "—",    inline: true },
      { name: `${E.sandclock} Juz`,     value: v.juz  ? `${v.juz} / 30`  : "—",    inline: true },
      { name: `${E.earth} Translation`, value: `<:internet:1490332305196060723> ${tr.name}`, inline: true },
    )
    .setFooter({ text: "القرآن الكريم — The Noble Quran" })
    .setTimestamp();
}

function surahEmbed(s, trKey = DEFAULT_TR) {
  const tr   = TRANSLATIONS[trKey] ?? TRANSLATIONS[DEFAULT_TR];
  const icon = s.revelation === "Meccan" ? E.key : E.leaf;
  const embed = new EmbedBuilder()
    .setColor(0x00695C)
    .setTitle(`${icon}  Surah ${s.number} — ${s.nameEnglish}  (${s.nameArabic})`)
    .addFields(
      { name: `${E.message} Meaning`,    value: s.meaning || "—",           inline: true },
      { name: `${E.pin} Revelation`,     value: `${icon} ${s.revelation}`,  inline: true },
      { name: `${E.pin} Total Ayahs`,    value: `${s.totalAyahs}`,          inline: true },
      { name: `${E.earth} Translation`,  value: `<:internet:1490332305196060723> ${tr.name}`, inline: true },
    );
  if (s.first) {
    embed.addFields(
      { name: `${E.letter} First Ayah (Arabic)`, value: s.first.arabic,               inline: false },
      { name: `${E.book} Translation`,            value: `*"${s.first.translation}"*`, inline: false }
    );
  }
  embed.setFooter({ text: "القرآن الكريم — AlQuran Cloud" }).setTimestamp();
  return embed;
}

function tafsirEmbed(data, key) {
  const t    = TAFSIRS[key] || { name: key, scholar: "", lang: "Unknown", flag: E.book };
  const raw  = data.tafsir?.text || "Tafsir unavailable.";
  const text = raw.length > 3900 ? raw.substring(0, 3900) + "\n*(truncated)*" : raw;
  return new EmbedBuilder().setColor(0x4A148C)
    .setAuthor({ name: `${t.flag}  ${t.name}  •  ${data.verse_key}` })
    .setTitle(`${E.book} ${t.scholar}`)
    .setDescription(text)
    .addFields(
      { name: `${E.pencil} Scholar`,     value: t.scholar,      inline: true },
      { name: `${E.speaker} Language`,   value: t.lang,         inline: true },
      { name: `${E.pin} Ayah`,           value: data.verse_key, inline: true }
    )
    .setFooter({ text: "UmmahAPI • تفسير القرآن الكريم" }).setTimestamp();
}

function duaEmbed(dua) {
  const cat  = DUAS[dua.category] || { name: dua.category_info?.name || dua.category, emoji: E.paper };
  const reps = dua.repeat > 1 ? `\n\n*Repeat: **${dua.repeat}x***` : "";
  return new EmbedBuilder().setColor(0x006064)
    .setAuthor({ name: `${cat.name}  •  Dua #${dua.id}` })
    .setTitle(dua.title)
    .setDescription(`**${dua.arabic}**\n\n*${dua.transliteration}*\n\n"${dua.translation}"${reps}`)
    .addFields(
      { name: `${E.book} Source`,     value: dua.source, inline: true },
      { name: `${E.folder} Category`, value: cat.name,   inline: true }
    )
    .setFooter({ text: "ادْعُونِي أَسْتَجِبْ لَكُمْ — Call upon Me; I will respond to you. (40:60)" })
    .setTimestamp();
}

function asmaEmbed(name) {
  const desc = name.description
    ? (name.description.length > 4000 ? name.description.substring(0, 4000) + "…" : name.description)
    : (name.meaning || "No description available.");

  return new EmbedBuilder()
    .setColor(0x1A237E)
    .setAuthor({ name: `Asma ul Husna — Name ${name.number} of 99` })
    .setTitle(`${name.arabic}  —  ${name.transliteration}`)
    .setDescription(desc)
    .addFields(
      { name: `${E.pin} Number`,             value: `${name.number} / 99`,       inline: true },
      { name: `${E.pencil} Transliteration`, value: name.transliteration || "—", inline: true },
      { name: `${E.brain} Translation`,      value: name.english || "—",          inline: true },
    )
    .setFooter({ text: "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ — To Allah belong the Most Beautiful Names. (7:180)" })
    .setTimestamp();
}

function hijriEmbed(data) {
  const { hijri: h, gregorian: g } = data;
  return new EmbedBuilder().setColor(0x3E2723).setTitle(`${E.sandclock}  Today's Islamic Date`)
    .addFields(
      { name: `<:paper:1490332319221809313> Hijri Date`,      value: `**${h.day} ${h.month_name} ${h.year} AH**`,   inline: false },
      { name: `${E.newspaper} Gregorian Date`, value: g.formatted || `${g.day}/${g.month}/${g.year}`, inline: false }
    )
    .setFooter({ text: "UmmahAPI • Hijri Calendar" }).setTimestamp();
}

function errEmbed(msg) {
  return new EmbedBuilder().setColor(0xB71C1C).setTitle(`${E.hazard}  Could not load`)
    .setDescription(msg).setFooter({ text: "Check the number/name and try again" });
}

function qiblaEmbed(data, city) {
  const bearing = data.bearing ?? data.direction ?? data.qibla ?? "—";
  const rounded = typeof bearing === "number" ? `${bearing.toFixed(1)}°` : `${bearing}°`;
  const compass = bearing !== "—" ? getCompassDir(bearing) : "";
  return new EmbedBuilder()
    .setColor(0x1B5E20)
    .setTitle(`Qibla Direction — ${city || "Your Location"}`)
    .setDescription(`${E.earth} **${rounded}** ${compass}\n\nFace **${rounded}** from North (clockwise) toward the Kaaba.`)
    .setFooter({ text: "UmmahAPI • Qibla Calculator" })
    .setTimestamp();
}

function getCompassDir(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW","N"];
  return dirs[Math.round(deg / 45) % 8];
}

function islamicEventsEmbed(events) {
  const list = Array.isArray(events) ? events : (events.events || Object.values(events));
  if (!list.length) return new EmbedBuilder().setColor(0x3E2723).setTitle("Islamic Events").setDescription("No events found.");
  const lines = list.slice(0, 15).map(e => {
    const name  = e.name || e.event || e.title || "—";
    const date  = e.hijri_date || e.date || e.hijri || "";
    const greg  = e.gregorian_date || e.gregorian || "";
    return `${E.bell} **${name}**${date ? `\n${E.sandclock} ${date}` : ""}${greg ? ` • ${greg}` : ""}`;
  });
  return new EmbedBuilder()
    .setColor(0x3E2723)
    .setTitle("Islamic Events")
    .setDescription(lines.join("\n\n") || "No events found.")
    .setFooter({ text: "UmmahAPI • Islamic Calendar" })
    .setTimestamp();
}

function asmaSearchEmbed(names, query) {
  if (!names.length) return new EmbedBuilder().setColor(0x1A237E).setTitle("Asma ul Husna — Search").setDescription(`No results for **"${query}"**.`);
  const lines = names.slice(0, 10).map(n =>
    `**${n.number}.** ${n.arabic} — ${n.transliteration} *(${n.english || n.meaning || ""})*`
  );
  return new EmbedBuilder()
    .setColor(0x1A237E)
    .setTitle(`Asma ul Husna — Search: "${query}"`)
    .setDescription(lines.join("\n"))
    .setFooter({ text: `${names.length} result(s) • UmmahAPI` })
    .setTimestamp();
}

function duaCategoriesEmbed(cats) {
  const list = Array.isArray(cats) ? cats : (cats.categories || Object.values(cats));
  const lines = list.map(c => {
    const name  = c.name || c.category || c.slug || "—";
    const slug  = c.slug || c.key || c.id || "";
    const count = c.count || c.total || "";
    return `${E.folder} **${name}**${count ? ` — ${count} duas` : ""}${slug ? `\n\`/dua category:${slug}\`` : ""}`;
  });
  return new EmbedBuilder()
    .setColor(0x006064)
    .setTitle("Dua Categories")
    .setDescription(lines.join("\n\n") || "No categories found.")
    .setFooter({ text: "UmmahAPI • Duas" })
    .setTimestamp();
}

// ─────────────────────────────────────────────────────
//  WORD BY WORD EMBED  — fixed: no [object Object], no ( )
// ─────────────────────────────────────────────────────
function wordByWordEmbed(data, surahN, ayahN) {
  const words = Array.isArray(data) ? data : (data.words || data.data || []);
  const surahName = SURAH_NAMES[surahN - 1] || `Surah ${surahN}`;

  if (!words.length) {
    return new EmbedBuilder().setColor(0x1B5E20)
      .setTitle(`Word by Word — ${surahName} ${surahN}:${ayahN}`)
      .setDescription("No word data available for this verse.")
      .setFooter({ text: "UmmahAPI • Quranic Arabic" });
  }

  const lines = words.map((w, i) => {
    // Safely extract strings; if the field is an object, drill into it
    const arabic   = stripParens(safeStr(w.arabic)   || safeStr(w.text)   || safeStr(w.word))   || "—";
    const translit = stripParens(safeStr(w.transliteration) || safeStr(w.roman));
    const meaning  = stripParens(safeStr(w.translation)     || safeStr(w.meaning) || safeStr(w.english));
    const pos      = safeStr(w.part_of_speech) || safeStr(w.pos);

    let line = `**${i + 1}.** ${arabic}`;
    if (translit) line += `  —  *${translit}*`;
    if (meaning)  line += `\n${E.brain} ${meaning}`;
    if (pos)      line += `  •  \`${pos}\``;
    return line;
  });

  // Split into chunks if too long
  const chunks = [];
  let current  = "";
  for (const line of lines) {
    if ((current + "\n\n" + line).length > 3900) {
      chunks.push(current);
      current = line;
    } else {
      current = current ? current + "\n\n" + line : line;
    }
  }
  if (current) chunks.push(current);

  return new EmbedBuilder()
    .setColor(0x1B5E20)
    .setTitle(`Word by Word — ${surahName} ${surahN}:${ayahN}`)
    .setDescription(chunks[0])
    .addFields(
      { name: `${E.book} Surah`, value: `${surahName} (${surahN})`, inline: true },
      { name: `${E.pin} Ayah`,   value: `${ayahN}`,                 inline: true },
      { name: `${E.pin} Words`,  value: `${words.length}`,          inline: true },
    )
    .setFooter({ text: "UmmahAPI • Quranic Arabic Word Analysis" })
    .setTimestamp();
}

function autoAyahEmbed(v, trKey = DEFAULT_TR) {
  const tr = TRANSLATIONS[trKey] ?? TRANSLATIONS[DEFAULT_TR];

  let desc = v.translation || "Translation unavailable.";
  if (v.arabic) desc += `\n\n> ${v.arabic}`;

  return new EmbedBuilder()
    .setColor(0x1B5E20)
    .setTitle(`${v.surahName} ${v.surahNum}:${v.ayahNum}  —  ${tr.name}`)
    .setDescription(desc)
    .addFields(
      { name: `${E.book} Surah`,        value: `${v.surahName} (${v.surahArabic})`, inline: true },
      { name: `${E.pin} Ayah`,          value: `${v.ayahNum} / ${v.totalAyahs}`,    inline: true },
      { name: `${E.newspaper} Page`,    value: v.page ? `${v.page} / 604` : "—",    inline: true },
      { name: `${E.sandclock} Juz`,     value: v.juz  ? `${v.juz} / 30`  : "—",    inline: true },
      { name: `${E.earth} Translation`, value: `<:internet:1490332305196060723> ${tr.name}`, inline: true },
    )
    .setFooter({ text: 'React to dismiss  •  القرآن الكريم' });
}

// ═══════════════════════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════════════════════
function colMenu() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId("sc").setPlaceholder("Switch collection…")
      .addOptions(COL_KEYS.slice(0,25).map(k => ({
        label: COLLECTIONS[k].name,
        description: `${COLLECTIONS[k].total.toLocaleString()} hadiths`,
        value: k, emoji: COLLECTIONS[k].emoji,
      })))
  );
}

function hadithBtns(colKey, num, showArabic = false) {
  const col  = COLLECTIONS[colKey];
  const n    = parseInt(num) || 1;
  const prev = Math.max(1, n - 1);
  const next = Math.min(col.total, n + 1);
  const rand = Math.floor(Math.random() * col.total) + 1;
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`hp|${colKey}|${prev}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(n <= 1),
    new ButtonBuilder().setCustomId(`hn|${colKey}|${next}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(n >= col.total),
    new ButtonBuilder().setCustomId(`hr|${colKey}|${rand}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`ha|${colKey}|${n}`).setLabel(showArabic ? "Hide Arabic" : "Arabic").setStyle(ButtonStyle.Secondary)
  );
}

function tranMenu(curKey, s, a, max) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId(`stm_${s}_${a}_${max}`)
      .setPlaceholder("Switch translation…")
      .addOptions(TRANS_KEYS.map(k => ({
        label: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`,
        value: k, default: k === curKey,
      })))
  );
}

function ayahBtns(s, a, max, trKey) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`ap_${s}_${Math.max(1,a-1)}_${max}_${trKey}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(a <= 1),
    new ButtonBuilder().setCustomId(`an_${s}_${Math.min(max,a+1)}_${max}_${trKey}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(a >= max),
    new ButtonBuilder().setCustomId(`ar_${trKey}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`to_${s}_${a}`).setLabel("Tafsir").setStyle(ButtonStyle.Success)
  );
}

function surahBtns(n, trKey) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`sp_${Math.max(1,n-1)}_${trKey}`).setLabel("◀ Prev Surah").setStyle(ButtonStyle.Secondary).setDisabled(n <= 1),
    new ButtonBuilder().setCustomId(`sn_${Math.min(114,n+1)}_${trKey}`).setLabel("Next Surah ▶").setStyle(ButtonStyle.Secondary).setDisabled(n >= 114),
    new ButtonBuilder().setCustomId(`sr_${trKey}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`sa_${n}_${trKey}`).setLabel("Read Ayahs").setStyle(ButtonStyle.Success)
  );
}

function tafsirMenu(s, a) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId("stf").setPlaceholder("Choose a Tafsir…")
      .addOptions(Object.entries(TAFSIRS).map(([k, v]) => ({
        label: `${v.flag} ${v.name}`, description: `${v.scholar} • ${v.lang}`,
        value: `${k}|${s}|${a}`,
      })))
  );
}

function duaCatMenu() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId("sdc").setPlaceholder("Choose a category…")
      .addOptions(DUA_KEYS.slice(0,25).map(k => ({
        label: `${DUAS[k].name}`, description: `${DUAS[k].count} duas`, value: k,
        emoji: DUAS[k].emoji,
      })))
  );
}

function duaBtns(cat, idx, total) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`dp_${cat}_${Math.max(0,idx-1)}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(idx <= 0),
    new ButtonBuilder().setCustomId(`dn_${cat}_${Math.min(total-1,idx+1)}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(idx >= total-1),
    new ButtonBuilder().setCustomId("dr").setLabel("🎲 Random").setStyle(ButtonStyle.Primary)
  );
}

function asmaBtns(n) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`xp_${Math.max(1,n-1)}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary).setDisabled(n <= 1),
    new ButtonBuilder().setCustomId(`xn_${Math.min(99,n+1)}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary).setDisabled(n >= 99),
    new ButtonBuilder().setCustomId(`xr_${Math.floor(Math.random()*99)+1}`).setLabel("🎲 Random").setStyle(ButtonStyle.Primary)
  );
}

// ═══════════════════════════════════════════════════════════════
//  SLASH COMMANDS
// ═══════════════════════════════════════════════════════════════
const commands = [
  new SlashCommandBuilder().setName("hadith").setDescription("Get a hadith by collection and number")
    .addStringOption(o => o.setName("collection").setDescription("Collection").setRequired(true)
      .addChoices(...COL_KEYS.slice(0,25).map(k => ({ name: COLLECTIONS[k].name, value: k }))))
    .addIntegerOption(o => o.setName("number").setDescription("Hadith number").setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName("random").setDescription("Get a random hadith")
    .addStringOption(o => o.setName("collection").setDescription("Collection (optional)")
      .addChoices(...COL_KEYS.slice(0,25).map(k => ({ name: COLLECTIONS[k].name, value: k })))),

  new SlashCommandBuilder().setName("ayah").setDescription("Get a Quran verse — surah can be a number or name")
    .addStringOption(o => o.setName("surah").setDescription("Surah number (1–114) or name e.g. Kahf, Al-Baqarah").setRequired(true))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName("translation").setDescription("Translation")
      .addChoices(...TRANS_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("surah").setDescription("Get surah info — accepts number or name")
    .addStringOption(o => o.setName("surah").setDescription("Surah number or name e.g. Yasin, 36").setRequired(true))
    .addStringOption(o => o.setName("translation").setDescription("Translation")
      .addChoices(...TRANS_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("randomayah").setDescription("Get a random Quran verse")
    .addStringOption(o => o.setName("translation").setDescription("Translation")
      .addChoices(...TRANS_KEYS.map(k => ({ name: `${TRANSLATIONS[k].flag} ${TRANSLATIONS[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("tafsir").setDescription("Get commentary for a verse")
    .addStringOption(o => o.setName("surah").setDescription("Surah number or name").setRequired(true))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName("scholar").setDescription("Tafsir (default: Ibn Kathir)")
      .addChoices(...Object.entries(TAFSIRS).map(([k,v]) => ({ name: `${v.flag} ${v.name} (${v.lang})`, value: k })))),

  new SlashCommandBuilder().setName("dua").setDescription("Browse duas by category or get a random one")
    .addStringOption(o => o.setName("category").setDescription("Category (optional)")
      .addChoices(...DUA_KEYS.slice(0,25).map(k => ({ name: `${DUAS[k].name}`, value: k })))),

  new SlashCommandBuilder().setName("asmaallah").setDescription("Browse the 99 Names of Allah")
    .addIntegerOption(o => o.setName("number").setDescription("Number 1–99").setMinValue(1).setMaxValue(99)),

  new SlashCommandBuilder().setName("hijri").setDescription("Get today's Hijri date"),
  new SlashCommandBuilder().setName("daily").setDescription("Daily hadith, ayah, and dua"),
  new SlashCommandBuilder().setName("collections").setDescription("List all hadith collections"),
  new SlashCommandBuilder().setName("explore").setDescription("Explore hadith collections interactively"),

  new SlashCommandBuilder().setName("qibla").setDescription("Get Qibla direction for a city")
    .addStringOption(o => o.setName("city").setDescription("City name e.g. Dubai, London, New York").setRequired(true)),

  new SlashCommandBuilder().setName("islamicevents").setDescription("Get upcoming Islamic events and dates"),

  new SlashCommandBuilder().setName("asmasearch").setDescription("Search the 99 Names of Allah by keyword")
    .addStringOption(o => o.setName("query").setDescription("e.g. merciful, king, light").setRequired(true)),

  new SlashCommandBuilder().setName("duacategories").setDescription("List all available dua categories"),

  new SlashCommandBuilder().setName("wordbyword").setDescription("Get word-by-word breakdown of a Quran verse")
    .addStringOption(o => o.setName("surah").setDescription("Surah number or name e.g. Fatihah, 1").setRequired(true))
    .addIntegerOption(o => o.setName("ayah").setDescription("Ayah number").setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName("arabicword").setDescription("Look up an Arabic word")
    .addStringOption(o => o.setName("word").setDescription("Arabic word e.g. رحمة").setRequired(true)),
].map(c => c.toJSON());

// ═══════════════════════════════════════════════════════════════
//  BOT READY
// ═══════════════════════════════════════════════════════════════
client.once("ready", async () => {
  console.log(`✅ Bot ready: ${client.user.tag}`);
  const [typeRaw, ...parts] = (process.env.BOT_STATUS || "WATCHING:/quran /hadith /asmaallah").split(":");
  client.user.setPresence({
    activities: [{ name: parts.join(":"), type: { PLAYING:0,STREAMING:1,LISTENING:2,WATCHING:3,COMPETING:5 }[typeRaw.toUpperCase()] ?? 3 }],
    status: process.env.BOT_ONLINE_STATUS || "idle",
  });
  const rest = new REST({ version:"10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log("✅ Commands registered");
  } catch(e) { console.error(e); }
});

// ═══════════════════════════════════════════════════════════════
//  INTERACTION HANDLER
// ═══════════════════════════════════════════════════════════════
client.on("interactionCreate", async interaction => {

  if (interaction.isChatInputCommand()) {
    await interaction.deferReply();
    const cmd = interaction.commandName;

    if (cmd === "hadith") {
      const colKey = interaction.options.getString("collection");
      const num    = interaction.options.getInteger("number");
      if (num > COLLECTIONS[colKey].total)
        return interaction.editReply({ embeds: [errEmbed(`${COLLECTIONS[colKey].name} only has up to #${COLLECTIONS[colKey].total}.`)] });
      try {
        const h = await fetchHadith(colKey, num);
        await interaction.editReply({ embeds: [hadithEmbed(h)], components: [hadithBtns(colKey, num), colMenu()] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed(`Could not load hadith #${num}.\n\`${e.message}\``)] });
      }
    }

    else if (cmd === "random") {
      const colKey = interaction.options.getString("collection") || null;
      try {
        const h   = await fetchRandomHadith(colKey);
        const num = parseInt(h.number) || 1;
        await interaction.editReply({ embeds: [hadithEmbed(h)], components: [hadithBtns(h.colKey, num), colMenu()] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not fetch a random hadith.")] });
      }
    }

    else if (cmd === "ayah") {
      const surahIn = interaction.options.getString("surah");
      const ayahN   = interaction.options.getInteger("ayah");
      const trKey   = interaction.options.getString("translation") || DEFAULT_TR;
      const surahN  = resolveSurah(surahIn);
      if (!surahN)
        return interaction.editReply({ embeds: [errEmbed(`Cannot find surah **"${surahIn}"**.\nUse a number 1–114 or a name like \`Al-Kahf\`, \`Yasin\`, \`Baqarah\`.`)] });
      try {
        const v = await fetchAyah(surahN, ayahN, trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, surahN, ayahN, v.totalAyahs), ayahBtns(surahN, ayahN, v.totalAyahs, trKey)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed(`Could not load ${surahN}:${ayahN}.`)] });
      }
    }

    else if (cmd === "surah") {
      const surahIn = interaction.options.getString("surah");
      const trKey   = interaction.options.getString("translation") || DEFAULT_TR;
      const surahN  = resolveSurah(surahIn);
      if (!surahN)
        return interaction.editReply({ embeds: [errEmbed(`Cannot find surah **"${surahIn}"**.`)] });
      try {
        const s = await fetchSurah(surahN, trKey);
        await interaction.editReply({ embeds: [surahEmbed(s, trKey)], components: [surahBtns(surahN, trKey)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed(`Could not load Surah ${surahN}.`)] });
      }
    }

    else if (cmd === "randomayah") {
      const trKey = interaction.options.getString("translation") || DEFAULT_TR;
      try {
        const v = await fetchRandomAyah(trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, v.surahNum, v.ayahNum, v.totalAyahs), ayahBtns(v.surahNum, v.ayahNum, v.totalAyahs, trKey)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not fetch a random ayah.")] });
      }
    }

    else if (cmd === "tafsir") {
      const surahIn = interaction.options.getString("surah");
      const ayahN   = interaction.options.getInteger("ayah");
      const tafsirK = interaction.options.getString("scholar") || "ibn_kathir";
      const surahN  = resolveSurah(surahIn);
      if (!surahN)
        return interaction.editReply({ embeds: [errEmbed(`Cannot find surah **"${surahIn}"**.`)] });
      try {
        const data = await getTafsir(tafsirK, surahN, ayahN);
        await interaction.editReply({ embeds: [tafsirEmbed(data, tafsirK)], components: [tafsirMenu(surahN, ayahN)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed(`Could not load tafsir for ${surahN}:${ayahN}.`)] });
      }
    }

    else if (cmd === "dua") {
      const cat = interaction.options.getString("category");
      try {
        if (cat) {
          const resp = await getDuasByCat(cat);
          const duas = Array.isArray(resp) ? resp : (resp.duas || []);
          if (!duas.length) return interaction.editReply({ embeds: [errEmbed("No duas found.")] });
          await interaction.editReply({ embeds: [duaEmbed(duas[0])], components: [duaCatMenu(), duaBtns(cat, 0, duas.length)] });
        } else {
          await interaction.editReply({ embeds: [duaEmbed(await getRandomDua())], components: [duaCatMenu()] });
        }
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not fetch a dua.")] });
      }
    }

    else if (cmd === "asmaallah") {
      const num = interaction.options.getInteger("number") || 1;
      try {
        const resp  = await getAllAsma();
        const names = Array.isArray(resp) ? resp : (resp.names || resp);
        const name  = names.find(n => n.number === num) || names[num - 1];
        if (!name) return interaction.editReply({ embeds: [errEmbed("Name not found.")] });
        await interaction.editReply({ embeds: [asmaEmbed(name)], components: [asmaBtns(num)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not load Asma ul Husna.")] });
      }
    }

    else if (cmd === "hijri") {
      try {
        await interaction.editReply({ embeds: [hijriEmbed(await getHijri())] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not fetch Hijri date.")] });
      }
    }

    else if (cmd === "daily") {
      try {
        const [h, v, dua, hijri] = await Promise.all([
          fetchRandomHadith(null), fetchRandomAyah(DEFAULT_TR),
          getRandomDua(), getHijri().catch(() => null),
        ]);
        const hE = hadithEmbed(h); hE.setTitle(`${E.sun}  Daily Hadith`);
        const aE = ayahEmbed(v);   aE.setTitle(`${E.book}  Daily Ayah`);
        const dE = duaEmbed(dua);  dE.setTitle(`${E.paper}  Daily Dua`);
        await interaction.editReply({ embeds: hijri ? [hijriEmbed(hijri), hE, aE, dE] : [hE, aE, dE] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not load daily content.")] });
      }
    }

    else if (cmd === "collections") {
      const lines = COL_KEYS.map(k => {
        const c = COLLECTIONS[k];
        return `${c.emoji} **${c.name}** (${c.arabic}) — ${c.total.toLocaleString()} hadiths`;
      });
      const total = COL_KEYS.reduce((s,k) => s + COLLECTIONS[k].total, 0);
      await interaction.editReply({ embeds: [
        new EmbedBuilder().setColor(0x5C4033).setTitle(`${E.book}  Hadith Collections`)
          .setDescription(lines.join("\n") + `\n\n**Total: ${total.toLocaleString()} across ${COL_KEYS.length} collections**`)
          .setFooter({ text: "fawazahmed0 CDN — free, no API key needed" })
      ]});
    }

    else if (cmd === "explore") {
      await interaction.editReply({ embeds: [
        new EmbedBuilder().setColor(0x4E342E).setTitle(`${E.magnify}  Hadith Explorer`)
          .setDescription(
            "Pick a collection to start browsing.\n**◀ / ▶** to navigate  •  **🎲** to jump anywhere\n\n" +
            COL_KEYS.map(k => `${COLLECTIONS[k].emoji} **${COLLECTIONS[k].name}** — ${COLLECTIONS[k].total.toLocaleString()}`).join("\n")
          )
          .setFooter({ text: "بسم الله الرحمن الرحيم" })
      ], components: [colMenu()] });
    }

    else if (cmd === "qibla") {
      const city = interaction.options.getString("city");
      try {
        const geoRes  = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoJson = await geoRes.json();
        const place   = geoJson.results?.[0];
        if (!place) return interaction.editReply({ embeds: [errEmbed(`Could not find city **"${city}"**.`)] });
        const { latitude: lat, longitude: lng, name, country } = place;
        const data = await getQibla(lat, lng);
        await interaction.editReply({ embeds: [qiblaEmbed(data, `${name}, ${country}`)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed(`Could not fetch Qibla for **${city}**.\n\`${e.message}\``)] });
      }
    }

    else if (cmd === "islamicevents") {
      try {
        const data = await getIslamicEvents();
        await interaction.editReply({ embeds: [islamicEventsEmbed(data)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not fetch Islamic events.")] });
      }
    }

    else if (cmd === "asmasearch") {
      const query = interaction.options.getString("query");
      try {
        const data  = await searchAsma(query);
        const names = Array.isArray(data) ? data : (data.names || data.results || []);
        await interaction.editReply({ embeds: [asmaSearchEmbed(names, query)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed(`Could not search for **"${query}"**.`)] });
      }
    }

    else if (cmd === "duacategories") {
      try {
        const data = await getDuaCategories();
        await interaction.editReply({ embeds: [duaCategoriesEmbed(data)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed("Could not fetch dua categories.")] });
      }
    }

    else if (cmd === "wordbyword") {
      const surahIn = interaction.options.getString("surah");
      const ayahN   = interaction.options.getInteger("ayah");
      const surahN  = resolveSurah(surahIn);
      if (!surahN)
        return interaction.editReply({ embeds: [errEmbed(`Cannot find surah **"${surahIn}"**.\nUse a number 1–114 or a name like \`Al-Kahf\`, \`Fatihah\`.`)] });
      if (!isValidAyah(surahN, ayahN))
        return interaction.editReply({ embeds: [errEmbed(`Ayah **${ayahN}** is out of range for that surah.`)] });
      try {
        const data = await getWordByWord(surahN, ayahN);
        await interaction.editReply({ embeds: [wordByWordEmbed(data, surahN, ayahN)] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed(`Could not load word breakdown for ${surahN}:${ayahN}.\n\`${e.message}\``)] });
      }
    }

    // ─── ARABIC WORD — fixed: uses UmmahAPI Asma search + Al-Maany fallback ───
    else if (cmd === "arabicword") {
      const word = interaction.options.getString("word");
      try {
        // Try Asma ul Husna search first (covers common Islamic terms)
        const asmaData  = await searchAsma(word).catch(() => null);
        const asmaNames = asmaData
          ? (Array.isArray(asmaData) ? asmaData : (asmaData.names || asmaData.results || []))
          : [];

        if (asmaNames.length) {
          await interaction.editReply({ embeds: [asmaSearchEmbed(asmaNames, word)] });
          return;
        }

        // No match — show helpful reference links
        const embed = new EmbedBuilder()
          .setColor(0x1A237E)
          .setTitle(`${E.brain}  Arabic Word — ${word}`)
          .setDescription(
            `No direct match found for **${word}** in the available databases.\n\n` +
            `**Look it up here:**\n` +
            `${E.link} [Al-Maany (Arabic ↔ English)](https://www.almaany.com/ar/dict/ar-en/${encodeURIComponent(word)}/)\n` +
            `${E.link} [Quranic Arabic Corpus](https://corpus.quran.com/)\n` +
            `${E.link} [Hans Wehr Dictionary](https://www.arabicstudent.info/hans-wehr/)\n` +
            `${E.link} [Lane's Lexicon](https://www.tyndalearchive.com/TABS/Lane/)\n\n` +
            `${E.idea} *Tip: Use \`/asmasearch\` for the 99 Names of Allah, or \`/wordbyword\` to analyse words inside a specific ayah.*`
          )
          .setFooter({ text: "Arabic Lexicon • البحث في المعجم العربي" })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch(e) {
        console.error(e);
        await interaction.editReply({ embeds: [errEmbed(`Could not look up **${word}**.\n\`${e.message}\``)] });
      }
    }
  }

  else if (interaction.isStringSelectMenu()) {
    const cid = interaction.customId;

    if (cid === "sc") {
      await interaction.deferUpdate();
      const colKey = interaction.values[0];
      try {
        const h = await fetchHadith(colKey, 1);
        await interaction.editReply({ embeds: [hadithEmbed(h)], components: [hadithBtns(colKey, 1), colMenu()] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed(`Could not load ${COLLECTIONS[colKey]?.name || colKey}.`)] });
      }
    }

    else if (cid.startsWith("stm_")) {
      await interaction.deferUpdate();
      const [,s,a,max] = cid.split("_");
      const surahN = parseInt(s), ayahN = parseInt(a), maxN = parseInt(max)||300;
      const trKey  = interaction.values[0];
      try {
        const v = await fetchAyah(surahN, ayahN, trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, surahN, ayahN, maxN), ayahBtns(surahN, ayahN, maxN, trKey)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not switch translation.")] });
      }
    }

    else if (cid === "stf") {
      await interaction.deferUpdate();
      const [tafsirK, s, a] = interaction.values[0].split("|");
      try {
        const data = await getTafsir(tafsirK, parseInt(s), parseInt(a));
        await interaction.editReply({ embeds: [tafsirEmbed(data, tafsirK)], components: [tafsirMenu(parseInt(s), parseInt(a))] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed(`Could not load tafsir for ${s}:${a}.`)] });
      }
    }

    else if (cid === "sdc") {
      await interaction.deferUpdate();
      const cat = interaction.values[0];
      try {
        const resp = await getDuasByCat(cat);
        const duas = Array.isArray(resp) ? resp : (resp.duas||[]);
        if (!duas.length) return interaction.editReply({ embeds: [errEmbed("No duas found.")] });
        await interaction.editReply({ embeds: [duaEmbed(duas[0])], components: [duaCatMenu(), duaBtns(cat, 0, duas.length)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not load that category.")] });
      }
    }
  }

  else if (interaction.isButton()) {
    const id = interaction.customId;

    if (/^h[pnra]\|/.test(id)) {
      await interaction.deferUpdate();
      const [code, colKey, numStr] = id.split("|");
      const num = parseInt(numStr);
      try {
        const h = await fetchHadith(colKey, num);
        const showArabic = code === "ha"
          ? !(interaction.message.embeds[0]?.fields?.some(f => f.name.includes("Arabic")) || false)
          : false;
        await interaction.editReply({ embeds: [hadithEmbed(h, showArabic)], components: [hadithBtns(colKey, num, showArabic), colMenu()] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed(`Could not load hadith #${num}.`)] });
      }
    }

    else if (id.startsWith("ap_") || id.startsWith("an_")) {
      await interaction.deferUpdate();
      const parts = id.split("_");
      const s = parseInt(parts[1]), a = parseInt(parts[2]), max = parseInt(parts[3])||300;
      const trKey = parts.slice(4).join("_") || DEFAULT_TR;
      try {
        const v = await fetchAyah(s, a, trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, s, a, max), ayahBtns(s, a, max, trKey)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not load that ayah.")] });
      }
    }

    else if (id.startsWith("ar_")) {
      await interaction.deferUpdate();
      const trKey = id.slice(3) || DEFAULT_TR;
      try {
        const v = await fetchRandomAyah(trKey);
        await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, v.surahNum, v.ayahNum, v.totalAyahs), ayahBtns(v.surahNum, v.ayahNum, v.totalAyahs, trKey)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not load a random ayah.")] });
      }
    }

    else if (id.startsWith("sp_") || id.startsWith("sn_") || id.startsWith("sr_") || id.startsWith("sa_")) {
      await interaction.deferUpdate();
      const code  = id.substring(0, 2);
      const parts = id.split("_");
      if (code === "sa") {
        const surahN = parseInt(parts[1]);
        const trKey  = parts.slice(2).join("_") || DEFAULT_TR;
        try {
          const v = await fetchAyah(surahN, 1, trKey);
          await interaction.editReply({ embeds: [ayahEmbed(v, trKey)], components: [tranMenu(trKey, surahN, 1, v.totalAyahs), ayahBtns(surahN, 1, v.totalAyahs, trKey)] });
        } catch {
          await interaction.editReply({ embeds: [errEmbed("Could not load that ayah.")] });
        }
        return;
      }
      const surahN = code === "sr" ? Math.floor(Math.random() * 114) + 1 : parseInt(parts[1]);
      const trKey  = code === "sr" ? parts.slice(1).join("_") || DEFAULT_TR : parts.slice(2).join("_") || DEFAULT_TR;
      try {
        const s = await fetchSurah(surahN, trKey);
        await interaction.editReply({ embeds: [surahEmbed(s, trKey)], components: [surahBtns(surahN, trKey)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed(`Could not load Surah ${surahN}.`)] });
      }
    }

    else if (id.startsWith("to_")) {
      await interaction.deferUpdate();
      const [,s,a] = id.split("_");
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(0x4A148C).setTitle(`${E.book}  Choose a Tafsir`)
          .setDescription(`Select commentary for **${s}:${a}**\n\n` +
            Object.entries(TAFSIRS).map(([,v]) => `${v.flag} **${v.name}** — *${v.scholar}* (${v.lang})`).join("\n"))
          .setFooter({ text: "تفسير القرآن الكريم — UmmahAPI" })],
        components: [tafsirMenu(parseInt(s), parseInt(a))],
      });
    }

    else if (id.startsWith("dp_") || id.startsWith("dn_")) {
      await interaction.deferUpdate();
      const parts = id.split("_");
      const cat = parts[1], idx = parseInt(parts[2]);
      try {
        const resp = await getDuasByCat(cat);
        const duas = Array.isArray(resp) ? resp : (resp.duas||[]);
        if (!duas[idx]) return interaction.editReply({ embeds: [errEmbed("Dua not found.")] });
        await interaction.editReply({ embeds: [duaEmbed(duas[idx])], components: [duaCatMenu(), duaBtns(cat, idx, duas.length)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not load that dua.")] });
      }
    }

    else if (id === "dr") {
      await interaction.deferUpdate();
      try {
        await interaction.editReply({ embeds: [duaEmbed(await getRandomDua())], components: [duaCatMenu()] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not load a random dua.")] });
      }
    }

    else if (id.startsWith("xp_") || id.startsWith("xn_") || id.startsWith("xr_")) {
      await interaction.deferUpdate();
      const num = parseInt(id.split("_")[1]);
      try {
        const resp  = await getAllAsma();
        const names = Array.isArray(resp) ? resp : (resp.names||resp);
        const name  = names.find(n => n.number === num) || names[num-1];
        if (!name) return interaction.editReply({ embeds: [errEmbed("Name not found.")] });
        await interaction.editReply({ embeds: [asmaEmbed(name)], components: [asmaBtns(num)] });
      } catch {
        await interaction.editReply({ embeds: [errEmbed("Could not load that name.")] });
      }
    }
  }
});

// ═══════════════════════════════════════════════════════════════
//  MESSAGE HANDLER — Hadith name detection + Auto-verse detection
// ═══════════════════════════════════════════════════════════════

const SURAH_MAX_AYAH = [
  0,7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,
  59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,
  52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,
  21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,4,
];
function isValidAyah(s, a) {
  return s >= 1 && s <= 114 && a >= 1 && a <= (SURAH_MAX_AYAH[s] || 286);
}

const VERSE_PATTERN  = /\[?(?:([\w\u0600-\u06FF''\-\u2019 ]{2,40})\s+)?(\d{1,3}):(\d{1,3})(?:-\d{1,3})?\]?/g;
const HADITH_PATTERN = /(?:^|\s)(?:hadith\s+)?([a-zA-Z\u0600-\u06FF'''\- ]{2,40}?)\s+(\d{1,5})(?:\s|$|[.,!?])/gi;

const autoVerseCooldown = new Map();
const AUTO_COOLDOWN_MS  = 5000;
const MAX_AUTO_VERSES   = 3;
const MAX_AUTO_HADITHS  = 2;

client.on("messageCreate", async message => {
  if (message.author.bot || message.webhookId) return;
  if (!message.content || message.content.length < 3) return;

  const now = Date.now();
  if (now - (autoVerseCooldown.get(message.channelId) || 0) < AUTO_COOLDOWN_MS) return;

  const verseMatches = [];
  let match;
  VERSE_PATTERN.lastIndex = 0;

  while ((match = VERSE_PATTERN.exec(message.content)) !== null && verseMatches.length < MAX_AUTO_VERSES) {
    const rawName  = match[1]?.trim() || null;
    const numPart  = parseInt(match[2]);
    const ayahPart = parseInt(match[3]);
    let surahN = rawName
      ? (resolveSurah(rawName) ?? (numPart >= 1 && numPart <= 114 ? numPart : null))
      : (numPart >= 1 && numPart <= 114 ? numPart : null);
    if (!surahN || !isValidAyah(surahN, ayahPart)) continue;
    const key = `${surahN}:${ayahPart}`;
    if (verseMatches.some(m => m.key === key)) continue;
    verseMatches.push({ surahN, ayahN: ayahPart, key });
  }

  const hadithMatches = [];
  HADITH_PATTERN.lastIndex = 0;

  let hMatch;
  while ((hMatch = HADITH_PATTERN.exec(message.content)) !== null && hadithMatches.length < MAX_AUTO_HADITHS) {
    const candidateName = hMatch[1].trim();
    const candidateNum  = parseInt(hMatch[2]);
    let resolved = resolveCollectionAndNumber(`${candidateName} ${candidateNum}`);
    if (!resolved) {
      const colKey = resolveCollectionKey(candidateName);
      if (colKey) resolved = { colKey, num: candidateNum };
    }
    if (!resolved) continue;
    const { colKey, num } = resolved;
    if (num < 1 || num > COLLECTIONS[colKey].total) continue;
    const key = `${colKey}:${num}`;
    if (hadithMatches.some(m => m.key === key)) continue;
    hadithMatches.push({ colKey, num, key });
  }

  if (!verseMatches.length && !hadithMatches.length) return;
  autoVerseCooldown.set(message.channelId, now);

  const verseResults  = await Promise.allSettled(verseMatches.map(m => fetchAyah(m.surahN, m.ayahN, DEFAULT_TR)));
  const hadithResults = await Promise.allSettled(hadithMatches.map(m => fetchHadith(m.colKey, m.num)));

  const verseEmbeds  = verseResults.filter(r => r.status === "fulfilled").map(r => autoAyahEmbed(r.value));
  const hadithEmbeds = hadithResults.filter(r => r.status === "fulfilled").map(r => hadithEmbed(r.value));

  const embeds = [...verseEmbeds, ...hadithEmbeds];
  if (!embeds.length) return;

  try {
    const reply = await message.reply({ embeds, allowedMentions: { repliedUser: false } });
    await reply.react("1490332293544411336").catch(() => {});
    reply.awaitReactions({
      filter: (reaction, user) => reaction.emoji.id === "1490332293544411336" && user.id === message.author.id,
      max: 1, time: 60_000, errors: [],
    }).then(collected => { if (collected.size) reply.delete().catch(() => {}); });
  } catch(e) {
    console.error("autoVerse/autoHadith error:", e);
  }
});

// ═══════════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════════
if (!process.env.DISCORD_TOKEN) {
  console.error("❌  DISCORD_TOKEN not set in .env");
  process.exit(1);
}
client.login(process.env.DISCORD_TOKEN);
