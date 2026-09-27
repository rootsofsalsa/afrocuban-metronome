// Homework links: a whole setup in a readable web address, for example
//   https://metronome.rootsofsalsa.com/?pattern=abakua&bpm=90&listen=2&yourturn=2&title=Week+40
// The owner posts these in YouTube descriptions, so a link must keep working for good: never rename or
// remove a link word, or change what a word or value means. Adding a new optional word is fine.
// No DOM or audio code here, so tests can run it in Node.
import { PATTERNS, SPANS } from "./patterns.js";
import { METERS, SUBS, SPAN_TO_METER } from "./meters.js";
import { gridInfo, defaultMet, curSpan, curMet, metKey } from "./grid.js";

export const LIVE_SITE = "https://metronome.rootsofsalsa.com/";

// Every word a link can use, in the order links write them.
export const LINK_WORDS = ["pattern", "cycle", "meter", "sub", "bpm", "clicks", "strokes", "mute",
  "click", "downbeat", "patternsound", "listen", "yourturn", "silence", "change", "every", "until", "countin", "title"];

// What a link sets for anything it doesn't mention, so every student gets the same exercise whatever they
// had set before. Part of the link contract: don't change these values.
const BASE = {bpm:80, sound:"wood", downSound:"click", metOn:true, patOn:true, hits:null, met:null, freeMet:null,
  tr:{on:false, step:2, every:4, target:140}, gap:{on:false, play:2, mute:2, what:"pattern"}, countIn:false};

// "One cycle" choices and Listen-then-play silence targets, as written in links.
const CYCLE_WORDS = {"2bar":"2bars", "1bar":"1bar", dq:"in2", e:"in6"};
const SILENCE_WORDS = {pattern:"pattern", clicks:"metronome", all:"all"};

// Metronome row: D = downbeat click, x = click, - = off. Pattern row: x = stroke, - = rest.
// (Not ".", because apps that turn text into links drop a trailing full stop.)
const CLICK_CHARS = "-xD";

const int = (v, min, max) => /^-?\d{1,4}$/.test(v ?? "") ? Math.min(max, Math.max(min, +v)) : null;
const wordFor = (map, value) => Object.keys(map).find(k => map[k] === value);

// The link for settings s. base is the page address the link opens (the live site, or the local preview).
export function makeLink(s, title = "", base = LIVE_SITE){
  const q = new URLSearchParams(), sp = curSpan(s), g = gridInfo(s);
  if(sp){
    q.set("pattern", s.pattern);
    if(sp.id !== SPANS[g.steps][0].id) q.set("cycle", CYCLE_WORDS[sp.id]);
  } else {
    const m = METERS.find(m => m.beats === s.beats && m.acc.join() === s.accents.join() && m.unit === s.unit) || METERS[0];
    q.set("pattern", "off");
    q.set("meter", m.id);
    if(s.sub !== m.sub) q.set("sub", s.sub);
  }
  q.set("bpm", s.bpm);
  const met = curMet(s);
  if(met.join() !== defaultMet("beats", g).join()) q.set("clicks", met.map(v => CLICK_CHARS[v]).join(""));
  if(sp && s.hits) q.set("strokes", Array.from({length:g.steps}, (_, i) => s.hits.includes(i) ? "x" : "-").join(""));
  const metOff = !s.metOn, patOff = sp && !s.patOn;
  if(metOff || patOff) q.set("mute", metOff && patOff ? "both" : metOff ? "metronome" : "pattern");
  if(s.sound !== BASE.sound) q.set("click", s.sound);
  if(s.downSound !== BASE.downSound) q.set("downbeat", s.downSound);
  if(sp && s.patSound !== PATTERNS[s.pattern].instrument) q.set("patternsound", s.patSound);
  if(s.gap.on){
    q.set("listen", s.gap.play); q.set("yourturn", s.gap.mute);
    if(sp && s.gap.what !== "pattern") q.set("silence", SILENCE_WORDS[s.gap.what]);
  }
  if(s.tr.on){ q.set("change", s.tr.step); q.set("every", s.tr.every); q.set("until", s.tr.target); }
  if(s.countIn) q.set("countin", "on");
  if(title.trim()) q.set("title", title.trim().slice(0, 80));
  return base + "?" + q;
}

// Reads a link's query ("?pattern=…"). Returns null when the address isn't a setup link (no pattern word),
// {settings:null, title} when its pattern isn't one this app has, or {settings, title}: a full set of
// settings (all but the volume levels, which stay each person's own). Anything else it doesn't understand
// is ignored. Sound names are checked by main.js (fixSounds), which knows the sound lists.
export function readLink(search){
  const q = new URLSearchParams(search);
  const title = (q.get("title") || "").trim().slice(0, 80);
  if(!q.has("pattern")) return null;
  const pattern = q.get("pattern") === "off" ? "none" : q.get("pattern");
  const p = PATTERNS[pattern];
  if(!p) return {settings:null, title};

  const s = structuredClone(BASE);
  s.pattern = pattern;
  if(p.steps){
    const sp = SPANS[p.steps].find(x => x.id === wordFor(CYCLE_WORDS, q.get("cycle"))) || SPANS[p.steps][0];
    const m = METERS.find(x => x.id === SPAN_TO_METER[sp.id]);
    Object.assign(s, {span:sp.id, beats:sp.beats, accents:sp.accents.slice(), sub:sp.sub, unit:m.unit, per:m.per, patSound:p.instrument});
  } else {
    const m = METERS.find(x => x.id === q.get("meter")) || METERS[0];
    const sub = int(q.get("sub"), 1, 6);
    Object.assign(s, {span:"2bar", beats:m.beats, accents:m.acc.slice(), unit:m.unit, per:m.per, patSound:"clave",
      sub:SUBS.some(x => x.n === sub) ? sub : m.sub});
  }
  s.bpm = int(q.get("bpm"), 20, 300) ?? BASE.bpm;

  const g = gridInfo(s);
  const clicks = q.get("clicks") || "";
  if(clicks.length === g.steps && [...clicks].every(c => CLICK_CHARS.includes(c))){
    const row = [...clicks].map(c => CLICK_CHARS.indexOf(c));
    if(row.join() !== defaultMet("beats", g).join()) s[metKey(s)] = row;
  }
  const strokes = q.get("strokes") || "";
  if(p.steps && strokes.length === g.steps && /^[x-]+$/.test(strokes)){
    const hits = [...strokes].flatMap((c, i) => c === "x" ? [i] : []);
    if(hits.join() !== p.hits.join()) s.hits = hits;
  }
  const mute = q.get("mute");
  if(mute === "metronome" || mute === "both") s.metOn = false;
  if(mute === "pattern" || mute === "both") s.patOn = false;
  if(q.get("click")) s.sound = q.get("click");
  if(q.get("downbeat")) s.downSound = q.get("downbeat");
  if(q.get("patternsound")) s.patSound = q.get("patternsound");

  if(q.has("listen") || q.has("yourturn")){
    s.gap.on = true;
    s.gap.play = int(q.get("listen"), 1, 32) ?? s.gap.play;
    s.gap.mute = int(q.get("yourturn"), 1, 32) ?? s.gap.mute;
    s.gap.what = wordFor(SILENCE_WORDS, q.get("silence")) || "pattern";
  }
  if(q.has("change") || q.has("every") || q.has("until")){
    s.tr.on = true;
    s.tr.step = int(q.get("change"), -20, 20) ?? s.tr.step;
    s.tr.every = int(q.get("every"), 1, 64) ?? s.tr.every;
    s.tr.target = int(q.get("until"), 20, 300) ?? s.tr.target;
  }
  s.countIn = q.get("countin") === "on";
  return {settings:s, title};
}
