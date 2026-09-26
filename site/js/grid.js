// Metronome-row defaults and quick fills. Pure functions, no DOM or audio code, so tests can run them in Node.
// Each function takes the app settings (s) as an argument instead of reading a global.
import { PATTERNS, SPANS } from "./patterns.js";

export const curHits = s => s.hits || PATTERNS[s.pattern].hits;

export function curSpan(s){
  const p = PATTERNS[s.pattern];
  if(!p.steps) return null;
  return SPANS[p.steps].find(x => x.id === s.span) || SPANS[p.steps][0];
}

// One step grid drives everything. With a pattern: the pattern's grid. Without: one bar of beats x subdivision.
export function gridInfo(s){
  const sp = curSpan(s);
  // spb = steps per BPM beat (where tempo is measured); num = steps per numerator beat of the time signature
  // main = steps per main pulse, two per bar: half notes in 4/4, dotted quarters in 6/8
  if(sp) return {steps:PATTERNS[s.pattern].steps, spb:sp.spb, num:sp.num, main:sp.spb*sp.beats/2, beats:sp.beats, pattern:true};
  const per = s.per || 1, num = s.sub % per === 0 ? s.sub / per : s.sub;
  return {steps:s.beats*s.sub, spb:s.sub, num, main:s.sub*s.beats/2, beats:s.beats, pattern:false};
}

// Metronome row: 0 = off, 1 = click, 2 = downbeat click.
// mode: "beats" (also the default), "down", "all" or "clear". g comes from gridInfo().
export function defaultMet(mode, g){
  return Array.from({length:g.steps}, (_, i) => {
    if(mode === "clear") return 0;
    const onPulse = i % g.spb === 0;            // where BPM is measured
    const onMain = i % g.main === 0;            // the two main pulses of each bar
    if(mode === "down") return onMain ? 2 : 0;
    if(mode === "all") return onMain ? 2 : 1;
    // "beats" (and pattern default): every numerator beat, downbeat click where BPM is measured
    return i % g.num === 0 ? (onPulse ? 2 : 1) : 0;
  });
}

// How many grid cells go on one row, when at most maxCells fit across the screen.
// The whole cycle if it fits; otherwise break at the barline (half the cycle); otherwise into
// whole groups (the visual beat groups of the grid) inside each half. A group is never split.
export function rowLength(steps, group, maxCells){
  if(steps <= maxCells) return steps;
  const half = steps / 2;
  for(let n = half; n > group; n--) if(half % n === 0 && n % group === 0 && n <= maxCells) return n;
  return group;
}

// Which hand plays a pattern stroke: "R", "L" or "F" (flam) from the pattern's sticking. A stroke removed on
// the grid and added back keeps its hand; a stroke added on a new step, or a pattern without sticking, plays "R".
const stickings = new Map();
export function strokeAt(s, step){
  const text = PATTERNS[s.pattern].sticking;
  if(!text) return "R";
  if(!stickings.has(text)) stickings.set(text, text.split(/\s+/).filter(t => t !== "|"));
  const letter = stickings.get(text)[step];
  return letter && letter !== "." ? letter : "R";
}

// Pattern mode and free mode keep separate metronome rows.
export const metKey = s => gridInfo(s).pattern ? "met" : "freeMet";

export function curMet(s){
  const g = gridInfo(s), m = s[metKey(s)];
  return (Array.isArray(m) && m.length === g.steps) ? m : defaultMet("auto", g);
}

// "Listen, then play" counts in pattern cycles: how many bars make one cycle (1 in free mode).
export function gapBarsPerUnit(g){
  return g.pattern ? Math.max(1, g.steps / (g.spb * g.beats)) : 1;
}
