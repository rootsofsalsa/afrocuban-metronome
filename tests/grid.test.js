// Phase 2: checks the quick-fill output for each span and each free-mode meter.
// Rows are written as in the build brief: D = downbeat click, x = click, . = off.
// Change these expectations only when the owner changes a counting or quick-fill rule.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { METERS, SUBS } from "../site/js/meters.js";
import { gridInfo, defaultMet, curMet, gapBarsPerUnit, rowLength } from "../site/js/grid.js";

const row = r => r.map(v => ".xD"[v]).join("");

// App settings for a pattern's "One cycle" option. Quick fills depend only on the step count,
// so one 16-step pattern (Clave Tres Dos) and one 12-step pattern (Campana de Abakuá) cover them all.
const cycle = (pattern, span) => ({pattern, span});

// App settings for a free-mode meter, set up the way main.js does it.
function free(meterId, sub){
  const m = METERS.find(x => x.id === meterId);
  return {pattern:"none", beats:m.beats, per:m.per, sub};
}

// Beats: clicks on every numerator beat, downbeat click where BPM is measured.
// Downbeats: downbeat clicks on the two main pulses of each bar (half notes in 4/4, dotted quarters in 6/8).
const CASES = [
  {name:"16-step 2bar",                   s:cycle("tresdos", "2bar"), beats:"D.x.D.x.D.x.D.x.", down:"D...D...D...D..."},
  {name:"16-step 1bar",                   s:cycle("tresdos", "1bar"), beats:"D...x...D...x...", down:"D.......D......."},
  {name:"12-step dq",                     s:cycle("abakua", "dq"),    beats:"DxxDxxDxxDxx",     down:"D..D..D..D.."},
  {name:"12-step e",                      s:cycle("abakua", "e"),     beats:"DDDDDDDDDDDD",     down:"D..D..D..D.."},
  {name:"Free: 4/4 cut time, 2 per beat", s:free("44in2", 2),         beats:"DxDx",             down:"D.D."},
  {name:"Free: 4/4 in 4, 2 per beat",     s:free("44in4", 2),         beats:"D.D.D.D.",         down:"D...D..."},
  {name:"Free: 6/8 in 2, 3 per beat",     s:free("68in2", 3),         beats:"DxxDxx",           down:"D..D.."},
  {name:"Free: 6/8 in 6, None",           s:free("68in6", 1),         beats:"DDDDDD",           down:"D..D.."},
];

for(const c of CASES){
  describe(c.name, () => {
    const fill = mode => row(defaultMet(mode, gridInfo(c.s)));
    test("Beats", () => assert.equal(fill("beats"), c.beats));
    test("Downbeats", () => assert.equal(fill("down"), c.down));
    test("Every step: downbeat clicks where Downbeats has them, clicks everywhere else", () => assert.equal(fill("all"), c.down.replaceAll(".", "x")));
    test("Clear", () => assert.equal(fill("clear"), ".".repeat(c.beats.length)));
    test("Beats is the default", () => assert.equal(row(curMet(c.s)), c.beats));
  });
}

test("Downbeats lands on the two main pulses of the bar, for every free-mode meter and subdivision", () => {
  for(const m of METERS) for(const {n, label} of SUBS){
    const g = gridInfo(free(m.id, n)), half = g.steps / 2;
    assert.equal(row(defaultMet("down", g)), ("D" + ".".repeat(half - 1)).repeat(2), `${m.label}, ${label}`);
  }
});

test("a saved metronome row is kept; one that doesn't fit the grid falls back to Beats", () => {
  const saved = [2,0,0,0, 1,0,0,0, 2,0,0,0, 1,0,0,0];
  assert.deepEqual(curMet({...cycle("tresdos", "2bar"), met:saved}), saved);
  assert.equal(row(curMet({...cycle("abakua", "dq"), met:saved})), "DxxDxxDxxDxx", "12-step pattern ignores a 16-step row");
  assert.equal(row(curMet({...free("44in2", 2), met:saved})), "DxDx", "free mode keeps its own row");
});

test("Listen, then play counts whole pattern cycles (bars in free mode)", () => {
  assert.equal(gapBarsPerUnit(gridInfo(cycle("tresdos", "2bar"))), 2, "2bar: 2 bars per cycle");
  assert.equal(gapBarsPerUnit(gridInfo(cycle("tresdos", "1bar"))), 1, "1bar: 1 bar per cycle");
  assert.equal(gapBarsPerUnit(gridInfo(cycle("abakua", "dq"))), 2, "dq: 2 bars per cycle");
  assert.equal(gapBarsPerUnit(gridInfo(cycle("abakua", "e"))), 2, "e: 2 bars per cycle");
  for(const m of METERS) assert.equal(gapBarsPerUnit(gridInfo(free(m.id, m.sub))), 1, `${m.label}: 1 bar`);
});

test("free mode offers only the four meters", () => {
  assert.deepEqual(METERS.map(m => ({label:m.label, beats:m.beats, unit:m.unit})), [
    {label:"4/4 cut time (in 2)", beats:2, unit:"half note"},
    {label:"4/4 (in 4)",          beats:4, unit:"quarter note"},
    {label:"6/8 (in 2)",          beats:2, unit:"dotted quarter note"},
    {label:"6/8 (in 6)",          beats:6, unit:"eighth note"},
  ]);
});

test("subdivisions are None, 2, 3, 4 or 6 per beat", () => {
  assert.deepEqual(SUBS.map(x => [x.n, x.label]), [[1, "None"], [2, "2 per beat"], [3, "3 per beat"], [4, "4 per beat"], [6, "6 per beat"]]);
});

// Phase 3: on a narrow screen the grid wraps onto more rows. The group is the grid's visual beat group:
// 4 steps for 16-step patterns, 3 for 12-step patterns, one BPM beat (the subdivision) in free mode.
describe("grid rows on narrow screens", () => {
  test("the whole cycle stays on one row when it fits", () => {
    assert.equal(rowLength(16, 4, 16), 16);
    assert.equal(rowLength(12, 3, 14), 12);
  });
  test("a phone (8 cells across) breaks 16 steps at the barline into 2 rows of 8", () => assert.equal(rowLength(16, 4, 8), 8));
  test("12-step patterns break at the barline into 2 rows of 6", () => assert.equal(rowLength(12, 3, 8), 6));
  test("if half a cycle is still too wide, rows hold whole groups", () => assert.equal(rowLength(16, 4, 7), 4));
  test("free mode: 4/4 in 4 with 6 per beat (24 steps) gives rows of one beat", () => assert.equal(rowLength(24, 6, 8), 6));
  test("free mode: 6/8 in 6 with 3 per beat (18 steps) never crosses the half bar", () => assert.equal(rowLength(18, 3, 8), 3));
  test("every row length divides the cycle evenly", () => {
    for(const [steps, group] of [[16, 4], [12, 3], [8, 2], [12, 6], [18, 3], [24, 6], [36, 6]])
      for(let max = 1; max <= 40; max++) assert.equal(steps % rowLength(steps, group, max), 0, `${steps} steps, ${max} across`);
  });
});
