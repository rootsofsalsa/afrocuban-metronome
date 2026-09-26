// Phase 2: checks every pattern name, step count and hit positions against CLAUDE.md.
// The expected values are copied from the pattern table in CLAUDE.md. Change them only when the owner changes a pattern.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PATTERNS, SPANS } from "../site/js/patterns.js";

// The table from CLAUDE.md, in the same order. This is also the order of the pattern menu.
// instrument is the pattern sound picked with the pattern; sticking is the owner's catá sticking (R, L, F = flam).
const CANON = [
  {id:"tresdos",   name:"Clave Tres Dos",           steps:16, meter:"4/4", notation:"x . . x . . x . | . . x . x . . .", hits:[0,3,6,10,12], instrument:"clave"},
  {id:"yambu",     name:"Clave de Yambú Matancera", steps:16, meter:"4/4", notation:"x . . x x . . x | x . x . x . . .", hits:[0,3,4,7,8,10,12], instrument:"clave"},
  {id:"dostres",   name:"Clave Dos Tres",           steps:16, meter:"4/4", notation:"x . . x . . . x | . . x . x . . .", hits:[0,3,7,10,12], instrument:"clave"},
  {id:"abakua",    name:"Campana de Abakuá",        steps:12, meter:"6/8", notation:"x . x . . x | . x . x . .",         hits:[0,2,5,7,9], instrument:"campana"},
  {id:"seisxocho", name:"Campana Seis por Ocho",    steps:12, meter:"6/8", notation:"x . x . x x | . x . x . x",         hits:[0,2,4,5,7,9,11], instrument:"campana"},
  {id:"guiro",     name:"Campana de Güiro",         steps:12, meter:"6/8", notation:". x x . x x | . x . x . x",         hits:[1,2,4,5,7,9,11], instrument:"campana"},
  {id:"habanero",  name:"Catá Habanero",            steps:16, meter:"4/4", notation:"x . x x . x . x | x . x . x x . x", hits:[0,2,3,5,7,8,10,12,13,15], instrument:"cata",
                                                                            sticking:"R . L R . L . L | R . L . R L . L"},
  {id:"matancero", name:"Catá Matancero",           steps:16, meter:"4/4", notation:"x x . x x x . x | x . x . x x . x", hits:[0,1,3,4,5,7,8,10,12,13,15], instrument:"cata",
                                                                            sticking:"R L . L R L . L | R . L . R L . L"},
  {id:"columbia",  name:"Catá de Columbia",         steps:12, meter:"6/8", notation:"x . x x . x | x x . x . .",         hits:[0,2,3,5,6,7,9], instrument:"cata",
                                                                            sticking:"F . R L . R | L R . F . ."},
];

test("the pattern menu is Off plus exactly the patterns in CLAUDE.md, in order", () => {
  assert.deepEqual(Object.keys(PATTERNS), ["none", ...CANON.map(c => c.id)]);
});

test("Off has no steps and no strokes", () => {
  assert.deepEqual(PATTERNS.none, {name:"Off", steps:0, hits:[]});
});

for(const c of CANON){
  test(c.name, () => {
    const p = PATTERNS[c.id];
    assert.ok(p, `pattern "${c.id}" is missing`);
    assert.equal(p.name, c.name, "display name");
    assert.equal(p.steps, c.steps, "step count");
    assert.deepEqual(p.hits, c.hits, "stroke positions");

    // The notation must say the same thing: two equal halves around the barline, x = stroke, . = rest.
    const halves = c.notation.split(" | ").map(h => h.split(" "));
    assert.equal(halves.length, 2, "notation has one barline");
    assert.ok(halves.every(h => h.length === c.steps / 2), "each half of the notation is half the steps");
    const cells = halves.flat();
    assert.ok(cells.every(t => t === "x" || t === "."), "notation uses only x and .");
    assert.deepEqual(cells.flatMap((t, i) => t === "x" ? [i] : []), p.hits, "notation matches the stroke positions");

    assert.ok(SPANS[c.steps].every(sp => sp.sig === c.meter), `meter is ${c.meter}`);
    assert.equal(p.instrument, c.instrument, "instrument");
    assert.equal(p.sticking, c.sticking, "sticking");

    // The sticking may only name the hand for each stroke: same halves and barline as the notation,
    // a letter (R, L or F) exactly where the notation has an x, a rest exactly where it has a dot.
    if(c.sticking){
      const sticks = c.sticking.split(" | ").map(h => h.split(" "));
      assert.deepEqual(sticks.map(h => h.length), halves.map(h => h.length), "sticking has the same halves as the notation");
      sticks.flat().forEach((t, i) => assert.ok(cells[i] === "x" ? "RLF".includes(t) && t.length === 1 : t === ".",
        `sticking step ${i}: "${t}" where the notation has "${cells[i]}"`));
    }
  });
}

// "One cycle" options. spb = steps per BPM beat, num = steps per numerator beat,
// beats = BPM beats per bar, unit = the note the BPM counts (shown next to the BPM).
const pick = sp => ({id:sp.id, sig:sp.sig, unit:sp.unit, spb:sp.spb, num:sp.num, beats:sp.beats});

test("patterns come only in 12 and 16 steps", () => {
  assert.deepEqual(Object.keys(SPANS), ["12", "16"]);
});

test("16-step patterns count in cut time: BPM = half note, 2 beats per bar", () => {
  assert.deepEqual(SPANS[16].map(pick), [
    {id:"2bar", sig:"4/4", unit:"half note", spb:4, num:2, beats:2},
    {id:"1bar", sig:"4/4", unit:"half note", spb:8, num:4, beats:2},
  ]);
});

test("12-step patterns count in dotted quarters (2 per bar), or in eighths (6 per bar)", () => {
  assert.deepEqual(SPANS[12].map(pick), [
    {id:"dq", sig:"6/8", unit:"dotted quarter note", spb:3, num:1, beats:2},
    {id:"e",  sig:"6/8", unit:"eighth note",         spb:1, num:1, beats:6},
  ]);
});
