// PATTERNS and SPANS: the single source of truth for every pattern. No DOM or audio code here.
// To add a pattern, add an entry to PATTERNS. It must have 12 or 16 steps, because the
// "One cycle" setting in SPANS is defined per step count.

/* Patterns: step indices of the strokes, 0-based. "none" is the Off choice (free mode).
   instrument: the pattern sound picked along with the pattern (clave, campana or cata).
   sticking (catá patterns, owner's): the notation with each stroke written R (right hand), L (left hand)
   or F (flam); "." is a rest and "|" the barline. Each letter must sit on a stroke in hits. */
export const PATTERNS = {
  none:       {name:"Off", steps:0, hits:[]},
  tresdos:    {name:"Clave Tres Dos", steps:16, hits:[0,3,6,10,12], instrument:"clave"},
  yambu:      {name:"Clave de Yambú Matancera", steps:16, hits:[0,3,4,7,8,10,12], instrument:"clave"},
  dostres:    {name:"Clave Dos Tres", steps:16, hits:[0,3,7,10,12], instrument:"clave"},
  abakua:     {name:"Campana de Abakuá", steps:12, hits:[0,2,5,7,9], instrument:"campana"},
  seisxocho:  {name:"Campana Seis por Ocho", steps:12, hits:[0,2,4,5,7,9,11], instrument:"campana"},
  guiro:      {name:"Campana de Güiro", steps:12, hits:[1,2,4,5,7,9,11], instrument:"campana"},
  habanero:   {name:"Catá Habanero", steps:16, hits:[0,2,3,5,7,8,10,12,13,15], instrument:"cata", sticking:"R . L R . L . L | R . L . R L . L"},
  matancero:  {name:"Catá Matancero", steps:16, hits:[0,1,3,4,5,7,8,10,12,13,15], instrument:"cata", sticking:"R L . L R L . L | R . L . R L . L"},
  columbia:   {name:"Catá de Columbia", steps:12, hits:[0,2,3,5,6,7,9], instrument:"cata", sticking:"F . R L . R | L R . F . ."},
};

/* "One cycle" setting per step count. The owner removed the other options, the 16th-note grid ("1bar") and
   "counted in 6" ("e"), on 2026-09-27, so each list has one entry.
   spb = steps per BPM beat (where tempo is measured); num = steps per numerator beat of the time signature. */
export const SPANS = {
  16: [{id:"2bar", num:2, sig:"4/4", unit:"half note", note:"Cut time · counted in 2", sub2:"BPM = half note · one cycle spans 2 bars", label:"2 bars of 4/4 (8th-note grid)", spb:4, beats:2, accents:[3,2], sub:2}],
  12: [{id:"dq", num:1, sig:"6/8", unit:"dotted quarter note", note:"Counted in 2", sub2:"BPM = dotted quarter note · one cycle spans 2 bars", label:"2 bars of 6/8 (dotted-quarter pulse)", spb:3, beats:2, accents:[3,2], sub:3}],
};
