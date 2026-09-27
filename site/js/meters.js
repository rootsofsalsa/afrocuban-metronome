// Free-mode meters and subdivisions (used when the pattern is Off).

// per = numerator beats of the time signature in one BPM beat (cut time: 2 quarters per half note)
export const METERS = [
  {id:"44in2", label:"4/4 cut time (in 2)", beats:2, acc:[3,2], unit:"half note", per:2, sub:2},
  {id:"44in4", label:"4/4 (in 4)", beats:4, acc:[3,2,2,2], unit:"quarter note", per:1, sub:2},
  {id:"68in2", label:"6/8 (in 2)", beats:2, acc:[3,2], unit:"dotted quarter note", per:3, sub:3},
  {id:"68in6", label:"6/8 (in 6)", beats:6, acc:[3,1,1,2,1,1], unit:"eighth note", per:1, sub:1},
];

export const SUBS = [{n:1,label:"None"},{n:2,label:"2 per beat"},{n:3,label:"3 per beat"},{n:4,label:"4 per beat"},{n:6,label:"6 per beat"}];

// Switching a pattern Off keeps the feel: each "One cycle" setting maps to the matching free-mode meter.
export const SPAN_TO_METER = {"2bar":"44in2", dq:"68in2"};
