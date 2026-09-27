// Recorded samples: which files the app looks for in site/samples/, and which recording plays for a stroke.
// No DOM or audio code here, so tests can run it in Node. Files are named <instrument>-<stroke>-<take>.m4a
// (see site/samples/README.md); takes are numbered from 1, and the app stops looking at the first missing number.

// The strokes recorded for each instrument (owner: one sound each for clave and campana; catá right hand,
// left hand and flam). Only the pattern sounds have recordings; the click sounds are always synthesized.
export const SAMPLE_STROKES = {clave:["main"], campana:["main"], cata:["right", "left", "flam"]};
export const MAX_TAKES = 10;

export const sampleFile = (instrument, stroke, take) => `${instrument}-${stroke}-${take}.m4a`;

// The catá sticking letters in patterns.js, and the recording each one plays.
const CATA_STROKES = {R:"right", L:"left", F:"flam"};

// The recording for a stroke: "clave-main", "campana-main", or "cata-right" / "cata-left" / "cata-flam"
// for hand "R" / "L" / "F" (right hand if none is given). null for sounds that are never recorded.
export function sampleKey(sound, hand){
  if(!SAMPLE_STROKES[sound]) return null;
  return sound === "cata" ? `cata-${CATA_STROKES[hand] || "right"}` : `${sound}-main`;
}

// Flam (owner): the grace note comes slightly before the beat, and the main stroke is on the beat. Every flam
// recording has its main stroke 25 ms after where other recordings start their stroke, so flams start 25 ms early.
export const FLAM_LEAD = 0.025;   // seconds

// How far ahead of the beat a recording starts.
export const sampleLead = (key) => key === "cata-flam" ? FLAM_LEAD : 0;
