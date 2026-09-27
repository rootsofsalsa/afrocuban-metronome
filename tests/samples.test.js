// Phase 4: checks the sample naming and which recording plays for each stroke.
import { test } from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_STROKES, sampleFile, sampleKey, FLAM_LEAD, sampleLead } from "../site/js/samples.js";

test("recorded strokes: one each for clave and campana; right, left and flam for catá", () => {
  assert.deepEqual(SAMPLE_STROKES, {clave:["main"], campana:["main"], cata:["right", "left", "flam"]});
});

test("file names follow site/samples/README.md", () => {
  assert.equal(sampleFile("clave", "main", 1), "clave-main-1.m4a");
  assert.equal(sampleFile("campana", "main", 3), "campana-main-3.m4a");
  assert.equal(sampleFile("cata", "flam", 2), "cata-flam-2.m4a");
});

test("clave and campana always play their one recording", () => {
  assert.equal(sampleKey("clave", "R"), "clave-main");
  assert.equal(sampleKey("campana", "F"), "campana-main");
});

test("catá plays the recording for the hand: R right, L left, F flam, none given = right", () => {
  assert.equal(sampleKey("cata", "R"), "cata-right");
  assert.equal(sampleKey("cata", "L"), "cata-left");
  assert.equal(sampleKey("cata", "F"), "cata-flam");
  assert.equal(sampleKey("cata"), "cata-right");
});

test("flams start 25 ms early so the main stroke is on the beat; every other recording starts on the beat", () => {
  assert.equal(FLAM_LEAD, 0.025);
  assert.equal(sampleLead("cata-flam"), 0.025);
  for(const k of ["cata-right", "cata-left", "clave-main", "campana-main"]) assert.equal(sampleLead(k), 0, k);
});

test("click sounds are never recorded", () => {
  for(const s of ["click", "wood", "stick", "beep"]) assert.equal(sampleKey(s, "R"), null, s);
});
